import React from 'react';
import { FiX } from 'react-icons/fi';
import { Button } from './Button'; // Assuming you have a Button component

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <Button 
            variant="ghost" 
            size="small" 
            onClick={onClose} 
            className="p-2"
            aria-label="Close modal"
          >
            <FiX className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
