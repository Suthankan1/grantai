import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.matcher import _fallback_candidates_from_chroma

def test_fallback_candidates_from_chroma():
    # Mock profile and filters
    profile = {
        "fullName": "Test User",
        "fieldOfStudy": "Computer Science",
        "degreeLevel": "PhD",
        "country": "United States",
    }
    filters = {}
    
    # Mock collection.get results
    mock_results = {
        "metadatas": [
            {"id": "grant-1", "title": "CS Research Grant", "field": "Computer Science", "country": "United States", "type": "fellowship"},
            {"id": "grant-2", "title": "Biology Grant", "field": "Biology", "country": "Canada", "type": "scholarship"},
        ],
        "documents": [
            "Research fellowship for PhD students in CS.",
            "Scholarship for biology students.",
        ]
    }
    
    mock_collection = MagicMock()
    mock_collection.get.return_value = mock_results
    
    with patch("app.core.chroma.get_grants_collection", return_value=mock_collection):
        grants = _fallback_candidates_from_chroma(profile, filters, n_results=10)
        
        # Verify collection.get was called
        mock_collection.get.assert_called_once_with(include=['documents', 'metadatas'])
        
        # Verify the returned grants
        assert len(grants) == 2
        assert grants[0]["id"] == "grant-1"
        assert grants[0]["description"] == "Research fellowship for PhD students in CS."
        assert grants[1]["id"] == "grant-2"
        assert grants[1]["description"] == "Scholarship for biology students."

def test_match_endpoint_fallback():
    # Test POST /ai/match
    client = TestClient(app)
    
    profile = {
        "fullName": "Test User",
        "fieldOfStudy": "Computer Science",
        "degreeLevel": "PhD",
        "country": "United States",
    }
    
    # Mock collection.get results
    mock_results = {
        "metadatas": [
            {"id": "grant-1", "title": "CS Research Grant", "field": "Computer Science", "country": "United States", "type": "fellowship"},
        ],
        "documents": [
            "Research fellowship for PhD students in CS.",
        ]
    }
    
    mock_collection = MagicMock()
    mock_collection.get.return_value = mock_results
    
    with patch("app.core.chroma.get_grants_collection", return_value=mock_collection), \
         patch("app.services.matcher._fallback_candidates_from_db", return_value=[]), \
         patch("app.services.matcher._semantic_candidates", side_effect=Exception("Semantic search offline")), \
         patch("app.main.enforce_api_key", return_value=None):
        
        response = client.post(
            "/ai/match",
            json={
                "profile": profile,
                "n_results": 5,
                "filters": {}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "matches" in data
        assert len(data["matches"]) == 1
        assert data["matches"][0]["id"] == "grant-1"
        assert data["matches"][0]["description"] == "Research fellowship for PhD students in CS."
