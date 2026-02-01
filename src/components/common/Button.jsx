import React from 'react';
import styles from './Button.module.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Button.jsx:21',message:'Button clicked',data:{hasOnClick:!!onClick,disabled,buttonText:typeof children === 'string' ? children : 'non-string',type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (onClick && !disabled) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Button.jsx:24',message:'Button calling onClick handler',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      onClick(e);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Button.jsx:26',message:'Button onClick handler completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
