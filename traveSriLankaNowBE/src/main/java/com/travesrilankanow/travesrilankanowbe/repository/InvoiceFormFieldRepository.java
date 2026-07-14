package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.InvoiceFormField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceFormFieldRepository extends JpaRepository<InvoiceFormField, Long> {
    List<InvoiceFormField> findByForm_IdOrderBySortOrderAsc(Long formId);
    void deleteByForm_Id(Long formId);
}
