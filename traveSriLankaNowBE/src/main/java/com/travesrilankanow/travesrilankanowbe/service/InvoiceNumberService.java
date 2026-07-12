package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class InvoiceNumberService {

    private final CompanyRepository companyRepo;

    @Transactional
    public String nextInvoiceNumber(Long companyId) {
        // Atomic: increment invoice_seq in the companies row using a native query
        companyRepo.incrementInvoiceSeq(companyId);
        var company = companyRepo.findById(companyId)
                .orElseThrow(() -> new IllegalStateException("Company not found: " + companyId));
        String prefix = company.getInvoicePrefix() != null ? company.getInvoicePrefix() : "INV";
        int year = LocalDate.now().getYear();
        long seq = company.getInvoiceSeq();
        return String.format("%s-%d-%04d", prefix, year, seq);
    }
}
