package com.travesrilankanow.travesrilankanowbe.service;

/** Literal template-key constants referenced from calling code — see EmailTemplate. */
public final class EmailTemplateKeys {
    /** Sent to the customer right after they submit a booking — it is still pending, not confirmed. */
    public static final String BOOKING_CONFIRMATION_CUSTOMER = "BOOKING_CONFIRMATION_CUSTOMER";
    public static final String BOOKING_CONFIRMATION_OWNER = "BOOKING_CONFIRMATION_OWNER";
    /** Sent to the customer when an admin changes a booking's status to confirmed. */
    public static final String BOOKING_CONFIRMED_CUSTOMER = "BOOKING_CONFIRMED_CUSTOMER";
    /** Sent to the customer when an admin changes a booking's status to cancelled. */
    public static final String BOOKING_CANCELLED_CUSTOMER = "BOOKING_CANCELLED_CUSTOMER";
    public static final String PASSWORD_RESET_OTP = "PASSWORD_RESET_OTP";
    /** Sent to the owner-notification address when a visitor submits the Contact Us form. */
    public static final String CONTACT_FORM_OWNER = "CONTACT_FORM_OWNER";
    /** Sent to the customer after they submit the Contact Us form, only if they gave an email. */
    public static final String CONTACT_FORM_CUSTOMER = "CONTACT_FORM_CUSTOMER";

    private EmailTemplateKeys() {}
}
