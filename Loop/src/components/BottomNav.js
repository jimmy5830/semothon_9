import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';

const NAV_ITEMS = [
    {
        path: '/home',
        label: '홈',
        icon: (active) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
                      fill={active ? 'var(--color-primary)' : 'none'}
                      stroke={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                      strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        path: '/matching',
        label: '매칭',
        icon: (active) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="8" r="3" stroke={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'} strokeWidth="1.8" fill={active ? 'var(--color-primary-pale)' : 'none'} />
                <circle cx="15" cy="8" r="3" stroke={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'} strokeWidth="1.8" fill={active ? 'var(--color-primary-pale)' : 'none'} />
                <path d="M3 19C3 16.2 5.7 14 9 14" stroke={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'} strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M21 19C21 16.2 18.3 14 15 14" stroke={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'} strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 14C14.2 14 16 15.8 16 18V19H8V18C8 15.8 9.8 14 12 14Z" fill={active ? 'var(--color-primary)' : 'none'} stroke={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'} strokeWidth="1.8" />
            </svg>
        ),
    },
    {
        path: '/records',
        label: '기록',
        icon: (active) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="3" width="16" height="18" rx="3"
                      fill={active ? 'var(--color-primary-pale)' : 'none'}
                      stroke={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                      strokeWidth="1.8"/>
                <path d="M8 8H16M8 12H16M8 16H12"
                      stroke={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                      strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        path: '/mypage',
        label: '마이',
        icon: (active) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4"
                        fill={active ? 'var(--color-primary-pale)' : 'none'}
                        stroke={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                        strokeWidth="1.8"/>
                <path d="M4 20C4 17.2 7.6 15 12 15C16.4 15 20 17.2 20 20"
                      stroke={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                      strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
        ),
    },
];

const Nav = styled.nav`
  height: var(--nav-height);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  box-shadow: 0 -2px 12px rgba(46,125,50,0.07);
  flex-shrink: 0;
`;

const NavItem = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 4px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
  &:active { background: var(--color-primary-pale); }
`;

const NavLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${p => p.active ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  font-family: var(--font);
  transition: color 0.15s;
`;

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Nav>
            {NAV_ITEMS.map(item => {
                const active = location.pathname === item.path;
                return (
                    <NavItem key={item.path} onClick={() => navigate(item.path)}>
                        {item.icon(active)}
                        <NavLabel active={active}>{item.label}</NavLabel>
                    </NavItem>
                );
            })}
        </Nav>
    );
}