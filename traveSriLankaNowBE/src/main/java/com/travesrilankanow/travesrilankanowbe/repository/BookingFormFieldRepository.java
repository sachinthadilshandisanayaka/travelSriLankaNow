package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.BookingFormField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingFormFieldRepository extends JpaRepository<BookingFormField, Long> {
    List<BookingFormField> findByActiveTrueOrderByDisplayOrderAsc();
    List<BookingFormField> findAllByOrderByDisplayOrderAsc();
    boolean existsByFieldKey(String fieldKey);
}
