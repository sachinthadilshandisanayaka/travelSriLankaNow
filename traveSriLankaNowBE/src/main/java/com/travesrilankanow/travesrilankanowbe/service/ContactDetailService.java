package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.ContactDetail;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.ContactDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactDetailService {

    private final ContactDetailRepository contactDetailRepository;

    public List<ContactDetail> getActiveByEntity(String entityType, Long entityId) {
        return contactDetailRepository
                .findByEntityTypeAndEntityIdAndIsActiveTrueOrderByDisplayOrderAsc(
                        entityType.toUpperCase(), entityId);
    }

    public List<ContactDetail> getAllByEntity(String entityType, Long entityId) {
        return contactDetailRepository
                .findByEntityTypeAndEntityIdOrderByDisplayOrderAsc(
                        entityType.toUpperCase(), entityId);
    }

    public ContactDetail getById(Long id) {
        return contactDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ContactDetail not found with id: " + id));
    }

    @Transactional
    public ContactDetail create(ContactDetail contactDetail) {
        contactDetail.setEntityType(contactDetail.getEntityType().toUpperCase());
        return contactDetailRepository.save(contactDetail);
    }

    @Transactional
    public ContactDetail update(Long id, ContactDetail updated) {
        ContactDetail existing = getById(id);
        existing.setContactType(updated.getContactType());
        existing.setValue(updated.getValue());
        existing.setLabel(updated.getLabel());
        existing.setDisplayOrder(updated.getDisplayOrder());
        existing.setIsActive(updated.getIsActive());
        return contactDetailRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!contactDetailRepository.existsById(id)) {
            throw new ResourceNotFoundException("ContactDetail not found with id: " + id);
        }
        contactDetailRepository.deleteById(id);
    }

    @Transactional
    public ContactDetail toggleActive(Long id) {
        ContactDetail existing = getById(id);
        existing.setIsActive(!existing.getIsActive());
        return contactDetailRepository.save(existing);
    }
}
