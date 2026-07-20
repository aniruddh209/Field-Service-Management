// ====================================
// Dashboard Configurations Data Store
// ====================================
//
// Centralized configurations and metadata logs for dashboards.
//
// ====================================

import {
  ClipboardList,
  Wrench,
  Users,
  CheckCircle,
  Plus,
  UserPlus,
  CalendarDays,
  AlertCircle,
  AlertTriangle,
  Receipt
} from 'lucide-react';

export const managementKpiCards = [
  {
    label: "Today's Requests",
    value: 18,
    change: '+3 from yesterday',
    iconName: 'ClipboardList',
    color: 'primary'
  },
  {
    label: 'Active Jobs',
    value: 9,
    change: '2 urgent',
    iconName: 'Wrench',
    color: 'info'
  },
  {
    label: 'Available Technicians',
    value: 6,
    change: 'of 12 total',
    iconName: 'Users',
    color: 'teal'
  },
  {
    label: 'Completed Today',
    value: 12,
    change: '+4 from yesterday',
    iconName: 'CheckCircle',
    color: 'success'
  }
];

export const managementQuickActions = [
  { label: 'Review Requests', desc: 'Inspect pending request queue', iconName: 'ClipboardList', color: 'primary', link: '/management/requests' },
  { label: 'Add Technician', desc: 'Onboard field provider', iconName: 'UserPlus', color: 'success', link: '/management/technicians' },
  { label: 'Review Completed Work', desc: 'Verify reports before billing', iconName: 'CheckCircle', color: 'info', link: '/management/completed-work' },
  { label: 'Generate Pending Invoices', desc: 'Bill approved completed jobs', iconName: 'Receipt', color: 'warning', link: '/management/invoices?filter=pending-generation' }
];

export const managementAttentionItems = [
  {
    id: 1,
    iconName: 'AlertCircle',
    text: 'Requests waiting for review',
    count: 4,
    color: 'primary',
    link: '/management/requests'
  },
  {
    id: 2,
    iconName: 'Users',
    text: 'Technician assignments awaiting acceptance',
    count: 2,
    color: 'teal',
    link: '/management/schedule'
  },
  {
    id: 3,
    iconName: 'AlertTriangle',
    text: 'Low-stock inventory items',
    count: 3,
    color: 'warning',
    link: '/management/inventory'
  },
  {
    id: 4,
    iconName: 'Receipt',
    text: 'Overdue invoices',
    count: 1,
    color: 'danger',
    link: '/management/invoices'
  }
];
