import React from 'react';
import './RelatedServices.css';

function RelatedServices({ related, bundles }) {
  return (
    <div className="related-services">
      <h3>Related Services</h3>
      <ul>
        {related.map((service, idx) => (
          <li key={idx} className="related-item">
            <span>{service.name}</span>
            {service.description && <span className="desc"> - {service.description}</span>}
          </li>
        ))}
      </ul>
      {bundles && bundles.length > 0 && (
        <div className="bundled-options">
          <h4>Bundled Options</h4>
          <ul>
            {bundles.map((bundle, idx) => (
              <li key={idx} className="bundle-item">
                <span>{bundle.name}</span>
                {bundle.services && (
                  <span className="bundle-services">: {bundle.services.join(', ')}</span>
                )}
                {bundle.discount && (
                  <span className="bundle-discount"> (Save {bundle.discount}%)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RelatedServices;
