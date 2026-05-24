"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Loader2, Menu } from "lucide-react";
import Link from "next/link";
import { listTracker, updateTracker, deleteTracker, createTracker, TrackerEntryApi } from "@/lib/api";
import TrackerCard from "@/components/tracker/TrackerCard";
import DetailDrawer from "@/components/tracker/DetailDrawer";
import AddApplicationModal from "@/components/tracker/AddApplicationModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { id: "Draft", label: "Draft", bg: "bg-[rgba(240,240,255,0.015)]" },
  { id: "Applied", label: "Applied", bg: "bg-[rgba(108,71,255,0.015)]" },
  { id: "Under Review", label: "Under Review", bg: "bg-[rgba(0,212,170,0.015)]" },
  { id: "Won", label: "Won", bg: "bg-[rgba(16,185,129,0.02)]" },
  { id: "Rejected", label: "Rejected", bg: "bg-[rgba(239,68,68,0.015)]" },
];

export default function TrackerPage() {
  const [cards, setCards] = useState<TrackerEntryApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDragCard, setActiveDragCard] = useState<TrackerEntryApi | null>(null);
  const [selectedCard, setSelectedCard] = useState<TrackerEntryApi | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetColumnStatus, setTargetColumnStatus] = useState("Draft");

  // Responsiveness state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags when trying to click cards
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch all tracked applications
  const fetchTrackerData = async () => {
    try {
      const response = await listTracker();
      setCards(response);
    } catch (err) {
      console.error("Failed to load tracker entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, []);

  // Partition cards by column status
  const cardsByColumn = useMemo(() => {
    const map: Record<string, TrackerEntryApi[]> = {
      Draft: [],
      Applied: [],
      "Under Review": [],
      Won: [],
      Rejected: [],
    };
    cards.forEach((card) => {
      if (map[card.status] !== undefined) {
        map[card.status].push(card);
      } else {
        // Fallback for case sensitivity or minor spelling differences
        const matchedCol = COLUMNS.find(
          (col) => col.id.toLowerCase() === card.status.toLowerCase()
        );
        if (matchedCol) {
          map[matchedCol.id].push(card);
        } else {
          map["Draft"].push(card);
        }
      }
    });
    return map;
  }, [cards]);

  // Aggregate stats: Won column total amount in USD/USD equivalent
  const wonAmount = useMemo(() => {
    return cardsByColumn["Won"].reduce((sum, card) => {
      if (card.grantAmount) {
        const val = typeof card.grantAmount === "string" ? parseFloat(card.grantAmount) : card.grantAmount;
        return sum + val;
      }
      return sum;
    }, 0);
  }, [cardsByColumn]);

  // Aggregate stats: Applied column total amount
  const appliedAmount = useMemo(() => {
    return cardsByColumn["Applied"].reduce((sum, card) => {
      if (card.grantAmount) {
        const val = typeof card.grantAmount === "string" ? parseFloat(card.grantAmount) : card.grantAmount;
        return sum + val;
      }
      return sum;
    }, 0);
  }, [cardsByColumn]);

  // Handle Drag Start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) {
      setActiveDragCard(card);
    }
  };

  // Handle Drag End - triggers PUT update with Optimistic UI updates
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragCard(null);

    if (!over) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    const draggedCard = cards.find((c) => c.id === cardId);
    if (!draggedCard) return;

    // Determine the target column status
    let targetStatus = draggedCard.status;

    // If over an actual column, set target status
    if (COLUMNS.some((col) => col.id === overId)) {
      targetStatus = overId;
    } else {
      // If over another card, find that card's status
      const overCard = cards.find((c) => c.id === overId);
      if (overCard) {
        targetStatus = overCard.status;
      }
    }

    if (draggedCard.status === targetStatus) return;

    // 1. Optimistic UI update
    const previousCards = [...cards];
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          const appliedDate =
            targetStatus === "Applied" && !c.appliedDate
              ? new Date().toISOString().split("T")[0]
              : c.appliedDate;

          return { ...c, status: targetStatus, appliedDate };
        }
        return c;
      })
    );

    // 2. Call PUT /api/tracker/:id
    try {
      const appliedDate =
        targetStatus === "Applied" && !draggedCard.appliedDate
          ? new Date().toISOString().split("T")[0]
          : draggedCard.appliedDate;

      await updateTracker(cardId, {
        status: targetStatus,
        appliedDate: appliedDate || undefined,
      });
    } catch (err) {
      console.error("Failed to update status on drop. Rolling back...", err);
      // Rollback to previous state
      setCards(previousCards);
      alert("Failed to synchronize change with the server. Action rolled back.");
    }
  };

  // Click card to open drawer
  const handleCardClick = (card: TrackerEntryApi) => {
    setSelectedCard(card);
    setIsDrawerOpen(true);
  };

  // Detail Drawer Update callback
  const handleDetailUpdate = async (id: string, payload: { status?: string; notes?: string; appliedDate?: string }) => {
    // 1. Optimistic update
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return { ...c, ...payload };
        }
        return c;
      })
    );

    // 2. Network save
    try {
      const updated = await updateTracker(id, payload);
      // Synchronize exact response
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
      if (selectedCard?.id === id) {
        setSelectedCard(updated);
      }
    } catch (err) {
      console.error("Failed to update detail fields:", err);
      // Fetch fresh data on error
      fetchTrackerData();
      throw err;
    }
  };

  // Detail Drawer Delete callback
  const handleDetailDelete = async (id: string) => {
    // 1. Optimistic delete
    setCards((prev) => prev.filter((c) => c.id !== id));
    
    // 2. Network delete
    try {
      await deleteTracker(id);
    } catch (err) {
      console.error("Failed to delete entry:", err);
      fetchTrackerData();
    }
  };

  // Add Modal Create callback
  const handleAddCreate = async (payload: { grantId: string; status?: string; notes?: string }) => {
    try {
      const created = await createTracker(payload);
      setCards((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Failed to create tracker entry:", err);
      throw err;
    }
  };

  // Click '+' on a column
  const handlePlusClick = (status: string) => {
    setTargetColumnStatus(status);
    setIsAddModalOpen(true);
  };

  // Format currency aggregates
  const formatAggregate = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.2),_transparent_40%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)]" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <span className="text-sm text-[var(--color-muted)] font-medium">Assembling application workspace...</span>
        </div>
      </section>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)] text-white overflow-hidden">
      {/* Sidebar navigation component */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Sleek radial lights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.06),_transparent_32%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
        <div className="absolute inset-0 bg-grid opacity-25 -z-10" aria-hidden="true" />

        {/* Mobile Header with Hamburger */}
        <header className="flex h-16 items-center justify-between border-b border-[rgba(240,240,255,0.05)] px-4 bg-[rgba(8,8,16,0.5)] backdrop-blur-md md:hidden shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] flex items-center justify-center shadow-glow-sm">
              <span className="text-[10px] font-bold text-white">G</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">GrantAI</span>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(240,240,255,0.06)] text-[var(--color-muted)] hover:text-white"
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Content Area */}
        <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-6">
            
            {/* Page Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(240,240,255,0.04)] pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/10 text-xs font-bold text-purple-400 border border-purple-500/20">A</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">GrantAI Platform</span>
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Application Tracker
                </h1>
                <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                  Drag-and-drop applications across pipelines. Track deadline thresholds, draft cover letters, and prepare mock presentations.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="rounded-xl text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg" onClick={() => handlePlusClick("Draft")}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Application
                </Button>
              </div>
            </div>

            {/* Kanban Board DndContext */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-5 min-h-[600px] items-start pb-10">
                {COLUMNS.map((column) => {
                  const columnCards = cardsByColumn[column.id] || [];

                  return (
                    <div
                      key={column.id}
                      className={`group/col flex flex-col rounded-3xl border border-[var(--border-default)] bg-[rgba(10,10,18,0.35)] p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[rgba(240,240,255,0.06)] min-h-[550px]`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(240,240,255,0.03)] mb-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold tracking-wide text-white uppercase">
                              {column.label}
                            </h3>
                            {/* Count Badge */}
                            <span className="rounded-md bg-[rgba(240,240,255,0.05)] px-2 py-0.5 text-[10px] font-bold text-[rgba(240,240,255,0.65)] border border-[rgba(240,240,255,0.08)]">
                              {columnCards.length}
                            </span>
                          </div>

                          {/* Aggregate totals intelligence */}
                          {column.id === "Won" && wonAmount > 0 && (
                            <span className="text-[10px] font-semibold text-emerald-400">
                              Won: {formatAggregate(wonAmount)}
                            </span>
                          )}
                          {column.id === "Applied" && appliedAmount > 0 && (
                            <span className="text-[10px] font-semibold text-purple-400">
                              Applied: {formatAggregate(appliedAmount)}
                            </span>
                          )}
                        </div>

                        {/* Column Quick Add Button */}
                        <button
                          onClick={() => handlePlusClick(column.id)}
                          className="rounded-lg p-1 text-[var(--color-muted)] hover:bg-[rgba(240,240,255,0.05)] hover:text-white transition-colors"
                        >
                          <Plus className="h-4.5 w-4.5" />
                        </button>
                      </div>

                      {/* Cards container using SortableContext */}
                      <SortableContext
                        items={columnCards.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div
                          id={column.id}
                          className="flex flex-col gap-3.5 overflow-y-auto max-h-[550px] pr-1.5 custom-scrollbar flex-1 pb-6"
                        >
                          {columnCards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-[rgba(240,240,255,0.04)] bg-[rgba(240,240,255,0.005)]">
                              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Empty column</span>
                            </div>
                          ) : (
                            columnCards.map((card) => (
                              <TrackerCard
                                key={card.id}
                                card={card}
                                onClick={handleCardClick}
                              />
                            ))
                          )}
                        </div>
                      </SortableContext>
                    </div>
                  );
                })}
              </div>

              {/* Draggable Overlay Replica */}
              <DragOverlay>
                {activeDragCard ? (
                  <div className="scale-105 rotate-1 shadow-2xl border-purple-500/50">
                    <TrackerCard card={activeDragCard} onClick={() => {}} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Slide-in Detail Drawer */}
          <DetailDrawer
            card={selectedCard}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onUpdate={handleDetailUpdate}
            onDelete={handleDetailDelete}
          />

          {/* Add Tracker Application Modal */}
          <AddApplicationModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            columnStatus={targetColumnStatus}
            onCreate={handleAddCreate}
          />
        </section>
      </div>
    </div>
  );
}
