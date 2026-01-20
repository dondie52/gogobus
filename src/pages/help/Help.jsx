import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Help.module.css';

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'How do I book a ticket?',
      answer: 'Search for your route on the home page, select your preferred bus and seat, fill in passenger details, and complete payment.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking from the "My Tickets" section. Cancellation policies may apply depending on the timing.'
    },
    {
      question: 'How do I track my bus?',
      answer: 'Once you have a confirmed ticket, you can view real-time bus location in the ticket details page.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept mobile money, credit/debit cards, and cash payments at select locations.'
    },
    {
      question: 'How do I change my travel date?',
      answer: 'You can modify your booking by canceling the current ticket and booking a new one, or contact our support team for assistance.'
    }
  ];

  return (
    <div className={styles.helpScreen}>
      <div className={styles.helpHeader}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Help & Support</h1>
      </div>

      <div className={styles.helpContent}>
        <section className={styles.contactSection}>
          <h2>Get in Touch</h2>
          <div className={styles.contactMethods}>
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>📞</div>
              <div>
                <h3>Phone</h3>
                <p>+267 7698 4827</p>
                <p className={styles.contactHours}>Mon-Fri: 8AM - 6PM</p>
              </div>
            </div>
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>✉️</div>
              <div>
                <h3>Email</h3>
                <p>support@gogobus.com</p>
                <p className={styles.contactHours}>24/7 Support</p>
              </div>
            </div>
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>💬</div>
              <div>
                <h3>Live Chat</h3>
                <p>Available in app</p>
                <p className={styles.contactHours}>Mon-Sun: 7AM - 9PM</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Help;
