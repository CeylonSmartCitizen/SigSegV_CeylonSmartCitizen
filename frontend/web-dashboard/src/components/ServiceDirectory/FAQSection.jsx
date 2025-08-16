import React, { useState } from 'react';
import './FAQSection.css';

function FAQSection({ faqs }) {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="faq-section">
      <h3>Frequently Asked Questions</h3>
      <ul>
        {faqs.map((faq, idx) => (
          <li key={idx} className="faq-item">
            <button className="faq-question" onClick={() => toggleFAQ(idx)}>
              {faq.question}
            </button>
            {openIdx === idx && (
              <div className="faq-answer">{faq.answer}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FAQSection;
