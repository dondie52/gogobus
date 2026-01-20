import React from 'react';
import { FiX } from 'react-icons/fi';
import Button from './Button';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <Button
            variant="ghost"
            size="small"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX />
          </Button>
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
