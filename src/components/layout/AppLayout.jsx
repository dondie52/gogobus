import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LiveChatWidget from '../chat/LiveChatWidget';
import styles from './AppLayout.module.css';

// Pages where chat widget should NOT appear
const HIDDEN_CHAT_PAGES = [
  '/',
  '/login',
  '/signup',
  '/get-started',
  '/onboarding',
  '/otp-verification',
  '/check-email',
  '/become-partner',
  '/complete-profile',
];

const AppLayout = ({ children }) => {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppLayout.jsx:20',message:'AppLayout render start',data:{hasChildren:!!children,childrenType:typeof children,childrenIsArray:Array.isArray(children)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const { user, loading } = useAuth();
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppLayout.jsx:23',message:'useAuth result',data:{hasUser:!!user,userId:user?.id,userEmail:user?.email,loading,userType:typeof user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const location = useLocation();
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppLayout.jsx:26',message:'useLocation result',data:{pathname:location?.pathname,hasLocation:!!location,locationType:typeof location},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  // Don't show chat widget on:
  // - Admin pages
  // - Auth/onboarding pages
  // - Splash screen (/)
  // - While auth is loading
  const isAdminPage = location.pathname.startsWith('/admin');
  const isHiddenPage = HIDDEN_CHAT_PAGES.includes(location.pathname) || 
                       location.pathname.startsWith('/onboarding');
  const showChatWidget = user && !loading && !isAdminPage && !isHiddenPage;
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppLayout.jsx:33',message:'showChatWidget evaluation',data:{isAdminPage,isHiddenPage,pathname:location?.pathname,hasUser:!!user,loading,showChatWidget,breakdown:{userExists:!!user,notLoading:!loading,notAdmin:!isAdminPage,notHidden:!isHiddenPage}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppLayout.jsx:35',message:'Before render return',data:{hasChildren:!!children,willRenderChatWidget:showChatWidget,className:styles.appLayout},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppLayout.jsx:38',message:'Rendering children',data:{hasChildren:!!children,childrenReactElement:!!(children && typeof children === 'object' && children.$$typeof)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  }, [children]);
  // #endregion
  
  // #region agent log
  useEffect(() => {
    const checkDOM = () => {
      const layoutEl = document.querySelector(`.${styles.appLayout}`);
      if (layoutEl) {
        const childrenEls = Array.from(layoutEl.children).filter(el => !el.querySelector('[class*="LiveChatWidget"]'));
        const firstChild = childrenEls[0];
        const computedStyle = firstChild ? window.getComputedStyle(firstChild) : null;
        const firstChildClasses = firstChild?.className || '';
        const firstChildText = firstChild?.textContent?.substring(0, 100) || '';
        const hasLoadingSpinner = firstChild?.querySelector('[class*="spinner"]') || firstChild?.querySelector('[class*="Spinner"]');
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppLayout.jsx:45',message:'DOM check after render',data:{hasLayoutEl:!!layoutEl,childrenCount:layoutEl?.children?.length,nonChatChildrenCount:childrenEls.length,firstChildExists:!!firstChild,firstChildTag:firstChild?.tagName,firstChildClasses,firstChildText,hasLoadingSpinner:!!hasLoadingSpinner,firstChildDisplay:computedStyle?.display,firstChildVisibility:computedStyle?.visibility,firstChildOpacity:computedStyle?.opacity,firstChildHeight:computedStyle?.height,firstChildWidth:computedStyle?.width,firstChildZIndex:computedStyle?.zIndex,firstChildOverflow:computedStyle?.overflow,firstChildMinHeight:computedStyle?.minHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      }
    };
    const timeoutId = setTimeout(checkDOM, 100);
    const timeoutId2 = setTimeout(checkDOM, 500);
    return () => { clearTimeout(timeoutId); clearTimeout(timeoutId2); };
  }, [children, location.pathname]);
  // #endregion
  
  return (
    <div className={styles.appLayout}>
      {children}
      {showChatWidget && <LiveChatWidget />}
    </div>
  );
};

export default AppLayout;
