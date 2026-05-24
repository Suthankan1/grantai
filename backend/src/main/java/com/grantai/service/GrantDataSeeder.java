package com.grantai.service;

import com.grantai.entity.Grant;
import com.grantai.repository.GrantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class GrantDataSeeder {

    private final GrantRepository grantRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        if (grantRepository.count() > 0) {
            return;
        }

        grantRepository.saveAll(sampleGrants());
    }

    private List<Grant> sampleGrants() {
        return List.of(
            grant("Climate Research Fellowship", "Aurora Science Trust", "Fellowship", "Environmental Science", "GB", "United Kingdom", 75000, "GBP", LocalDate.now().plusDays(28),
                "A prestigious fellowship for early-career researchers studying climate adaptation and resilience.",
                "Open to doctoral researchers and postdocs with a demonstrated record of climate-related work.",
                "Shortlist in two rounds, then final interviews in six weeks.",
                "https://example.com/apply/climate-research-fellowship",
                "https://example.com/grants/climate-research-fellowship"),
            grant("STEM Scholars Award", "Future Minds Foundation", "Scholarship", "Computer Science", "US", "United States", 50000, "USD", LocalDate.now().plusDays(75),
                "Merit-based funding for students building software, data, and AI projects with social impact.",
                "Applicants must maintain strong academic standing and show evidence of community contribution.",
                "Awards announced one month after the spring cycle closes.",
                "https://example.com/apply/stem-scholars",
                "https://example.com/grants/stem-scholars"),
            grant("Global Health Innovation Grant", "WellSpring Alliance", "Research Grant", "Public Health", "KE", "Kenya", 120000, "USD", LocalDate.now().plusDays(41),
                "Supports field-based pilots that improve access to primary care and maternal health outcomes.",
                "Teams from universities, NGOs, and hospitals may apply with a local implementation partner.",
                "Select projects begin with a 12-week prototyping phase.",
                "https://example.com/apply/global-health",
                "https://example.com/grants/global-health"),
            grant("Creative Futures Residency", "Northstar Arts Council", "Fellowship", "Arts", "CA", "Canada", 30000, "CAD", LocalDate.now().plusDays(18),
                "Residency funding for artists blending digital media, public art, and civic engagement.",
                "Open to individual artists and small collectives with a clear exhibition plan.",
                "Residencies run for six months with a midpoint critique and final showcase.",
                "https://example.com/apply/creative-futures",
                "https://example.com/grants/creative-futures"),
            grant("Community Impact Microgrant", "Civic Spark Lab", "Scholarship", "Education", "AU", "Australia", 15000, "AUD", LocalDate.now().plusDays(58),
                "Microgrants for student groups running community learning and mentoring programs.",
                "Student-led nonprofits, school clubs, and youth collectives may apply.",
                "Awards are issued on a rolling basis with decisions every 30 days.",
                "https://example.com/apply/community-impact",
                "https://example.com/grants/community-impact"),
            grant("Women in Engineering Scholarship", "Atlas Industries", "Scholarship", "Engineering", "DE", "Germany", 60000, "EUR", LocalDate.now().plusDays(91),
                "Supports women pursuing graduate study in mechanical, electrical, and systems engineering.",
                "Applicants must demonstrate leadership and a commitment to STEM mentorship.",
                "Applications are reviewed by a panel of industry and university leaders.",
                "https://example.com/apply/women-engineering",
                "https://example.com/grants/women-engineering"),
            grant("Data for Good Research Grant", "Open Evidence Fund", "Research Grant", "Data Science", "US", "United States", 98000, "USD", LocalDate.now().plusDays(32),
                "Funding for research that uses data science to improve civic systems and public outcomes.",
                "Principal investigators and cross-functional research teams are encouraged to apply.",
                "Recipients report progress every quarter and present findings in a final symposium.",
                "https://example.com/apply/data-for-good",
                "https://example.com/grants/data-for-good"),
            grant("Entrepreneurship Seed Fellowship", "Harbor Launchpad", "Fellowship", "Business", "SG", "Singapore", 85000, "SGD", LocalDate.now().plusDays(64),
                "Seed support for founders developing scalable solutions in climate, logistics, or fintech.",
                "Founders must have a prototype, incorporated entity, and a viable go-to-market plan.",
                "The fellowship includes an accelerator sprint and demo day exposure.",
                "https://example.com/apply/entrepreneurship-seed",
                "https://example.com/grants/entrepreneurship-seed")
        );
    }

    private Grant grant(
        String title,
        String provider,
        String grantType,
        String field,
        String countryCode,
        String countryName,
        int amount,
        String currency,
        LocalDate deadline,
        String description,
        String eligibility,
        String timeline,
        String applicationUrl,
        String sourceUrl
    ) {
        return Grant.builder()
            .title(title)
            .provider(provider)
            .grantType(grantType)
            .field(field)
            .countryCode(countryCode)
            .countryName(countryName)
            .amount(BigDecimal.valueOf(amount))
            .currency(currency)
            .deadline(deadline)
            .description(description)
            .eligibility(eligibility)
            .timeline(timeline)
            .documentsRequired(List.of("CV", "Statement", "Budget"))
            .applicationUrl(applicationUrl)
            .sourceUrl(sourceUrl)
            .build();
    }
}