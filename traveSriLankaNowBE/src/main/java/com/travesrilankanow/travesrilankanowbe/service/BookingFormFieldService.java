package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.BookingFormField;
import com.travesrilankanow.travesrilankanowbe.repository.BookingFormFieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingFormFieldService {

    private final BookingFormFieldRepository repo;

    public List<BookingFormField> getAll() {
        return repo.findAllByOrderByDisplayOrderAsc();
    }

    public List<BookingFormField> getActive() {
        return repo.findByActiveTrueOrderByDisplayOrderAsc();
    }

    @Transactional
    public BookingFormField create(BookingFormField field) {
        if (field.getFieldKey() == null || field.getFieldKey().isBlank()) {
            field.setFieldKey(generateKey(field.getLabel()));
        }
        if (repo.existsByFieldKey(field.getFieldKey())) {
            field.setFieldKey(field.getFieldKey() + "_" + System.currentTimeMillis());
        }
        return repo.save(field);
    }

    @Transactional
    public BookingFormField update(Long id, BookingFormField incoming) {
        BookingFormField existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Form field not found: " + id));
        existing.setLabel(incoming.getLabel());
        existing.setFieldType(incoming.getFieldType());
        existing.setPlaceholder(incoming.getPlaceholder());
        existing.setRequired(incoming.isRequired());
        existing.setOptions(incoming.getOptions());
        existing.setDisplayOrder(incoming.getDisplayOrder());
        existing.setActive(incoming.isActive());
        return repo.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        repo.deleteById(id);
    }

    private String generateKey(String label) {
        return label == null ? "field"
                : label.toLowerCase().replaceAll("[^a-z0-9]+", "_").replaceAll("^_|_$", "");
    }
}
