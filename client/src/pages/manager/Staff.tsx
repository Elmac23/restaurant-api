import { useState } from 'react';
import ManagerHeader from '../../components/manager/ManagerHeader';
import ManagerSidebar from '../../components/manager/ManagerSidebar';
import '../../styles/manager/Staff.css';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'chef' | 'waiter' | 'manager';
  status: 'active' | 'break' | 'offline';
  shift: string;
  phone: string;
  hireDate: string;
  performance: {
    ordersCompleted: number;
    avgTime: number;
    rating: number;
  };
}

interface Shift {
  id: string;
  date: string;
  timeSlot: string;
  staffIds: string[];
  status: 'scheduled' | 'active' | 'completed';
}

function ManagerStaff() {
  const [activeTab, setActiveTab] = useState<'staff' | 'schedule'>('staff');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Mock staff data
  const staffMembers: StaffMember[] = [
    {
      id: '1',
      name: 'Anna Kowalski',
      email: 'anna.kowalski@restaurant.com',
      role: 'chef',
      status: 'active',
      shift: '08:00 - 16:00',
      phone: '+48 123 456 789',
      hireDate: '2024-01-15',
      performance: {
        ordersCompleted: 142,
        avgTime: 16,
        rating: 4.8
      }
    },
    {
      id: '2',
      name: 'Piotr Nowak',
      email: 'piotr.nowak@restaurant.com',
      role: 'waiter',
      status: 'active',
      shift: '10:00 - 18:00',
      phone: '+48 987 654 321',
      hireDate: '2024-03-20',
      performance: {
        ordersCompleted: 89,
        avgTime: 8,
        rating: 4.6
      }
    },
    {
      id: '3',
      name: 'Maria Wiśniewska',
      email: 'maria.wisniewska@restaurant.com',
      role: 'chef',
      status: 'break',
      shift: '12:00 - 20:00',
      phone: '+48 555 123 456',
      hireDate: '2023-11-10',
      performance: {
        ordersCompleted: 167,
        avgTime: 20,
        rating: 4.3
      }
    },
    {
      id: '4',
      name: 'Jan Kowalczyk',
      email: 'jan.kowalczyk@restaurant.com',
      role: 'waiter',
      status: 'offline',
      shift: '16:00 - 24:00',
      phone: '+48 777 888 999',
      hireDate: '2024-02-01',
      performance: {
        ordersCompleted: 73,
        avgTime: 10,
        rating: 4.4
      }
    }
  ];

  // Mock schedule data
  const schedule: Shift[] = [
    {
      id: '1',
      date: '2025-05-28',
      timeSlot: '08:00 - 16:00',
      staffIds: ['1', '2'],
      status: 'active'
    },
    {
      id: '2',
      date: '2025-05-28',
      timeSlot: '12:00 - 20:00',
      staffIds: ['3'],
      status: 'active'
    },
    {
      id: '3',
      date: '2025-05-28',
      timeSlot: '16:00 - 24:00',
      staffIds: ['4'],
      status: 'scheduled'
    },
    {
      id: '4',
      date: '2025-05-29',
      timeSlot: '08:00 - 16:00',
      staffIds: ['1', '4'],
      status: 'scheduled'
    }
  ];

  const [staff, setStaff] = useState<StaffMember[]>(staffMembers);

  const filteredStaff = selectedRole === 'all' 
    ? staff 
    : staff.filter(member => member.role === selectedRole);

  const getRoleLabel = (role: string) => {
    const labels = {
      chef: 'Kucharz',
      waiter: 'Kelner',
      manager: 'Manager'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Aktywny',
      break: 'Przerwa',
      offline: 'Offline'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const updateStaffStatus = (staffId: string, newStatus: StaffMember['status']) => {
    setStaff(prevStaff =>
      prevStaff.map(member =>
        member.id === staffId
          ? { ...member, status: newStatus }
          : member
      )
    );
  };

  const getStaffByIds = (ids: string[]) => {
    return staff.filter(member => ids.includes(member.id));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="manager-layout">
      <ManagerHeader />
      
      <div className="manager-container">
        <ManagerSidebar />
        
        <main className="manager-content">
          <h1>Zarządzanie Personelem</h1>
          
          <div className="staff-tabs">
            <button 
              className={activeTab === 'staff' ? 'active' : ''}
              onClick={() => setActiveTab('staff')}
            >
              Lista Pracowników
            </button>
            <button 
              className={activeTab === 'schedule' ? 'active' : ''}
              onClick={() => setActiveTab('schedule')}
            >
              Harmonogram
            </button>
          </div>

          {activeTab === 'staff' && (
            <div className="staff-management">
              <div className="staff-controls">
                <div className="role-filter">
                  <label>Filtruj według roli:</label>
                  <select 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="all">Wszystkie role</option>
                    <option value="chef">Kucharze</option>
                    <option value="waiter">Kelnerzy</option>
                    <option value="manager">Managerowie</option>
                  </select>
                </div>
                
                <div className="staff-summary">
                  <span className="active-count">
                    Aktywnych: {staff.filter(s => s.status === 'active').length}
                  </span>
                  <span className="total-count">
                    Łącznie: {staff.length}
                  </span>
                </div>
              </div>

              <div className="staff-grid">
                {filteredStaff.map(member => (
                  <div key={member.id} className={`staff-card ${member.status}`}>
                    <div className="staff-header">
                      <h3>{member.name}</h3>
                      <div className={`staff-status status-${member.status}`}>
                        {getStatusLabel(member.status)}
                      </div>
                    </div>
                    
                    <div className="staff-info">
                      <div className="info-row">
                        <span className="label">Rola:</span>
                        <span className="value role">{getRoleLabel(member.role)}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Email:</span>
                        <span className="value">{member.email}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Telefon:</span>
                        <span className="value">{member.phone}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Zmiana:</span>
                        <span className="value">{member.shift}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Zatrudniony:</span>
                        <span className="value">{new Date(member.hireDate).toLocaleDateString('pl-PL')}</span>
                      </div>
                    </div>
                    
                    <div className="performance-metrics">
                      <h4>Wydajność</h4>
                      <div className="metrics-grid">
                        <div className="metric">
                          <span className="metric-label">Zamówienia</span>
                          <span className="metric-value">{member.performance.ordersCompleted}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Śr. czas</span>
                          <span className="metric-value">{member.performance.avgTime} min</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Ocena</span>
                          <span className="metric-value">{member.performance.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="staff-actions">
                      {member.status === 'active' && (
                        <button 
                          className="btn btn-warning"
                          onClick={() => updateStaffStatus(member.id, 'break')}
                        >
                          Wyślij na przerwę
                        </button>
                      )}
                      {member.status === 'break' && (
                        <button 
                          className="btn btn-success"
                          onClick={() => updateStaffStatus(member.id, 'active')}
                        >
                          Wznów pracę
                        </button>
                      )}
                      {member.status === 'offline' && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => updateStaffStatus(member.id, 'active')}
                        >
                          Aktywuj
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="schedule-management">
              <h3>Harmonogram pracy</h3>
              
              <div className="schedule-view">
                {schedule.map(shift => (
                  <div key={shift.id} className={`schedule-item status-${shift.status}`}>
                    <div className="schedule-header">
                      <h4>{formatDate(shift.date)}</h4>
                      <span className="time-slot">{shift.timeSlot}</span>
                      <div className={`shift-status status-${shift.status}`}>
                        {shift.status === 'active' ? 'Aktywna' : 
                         shift.status === 'scheduled' ? 'Zaplanowana' : 'Zakończona'}
                      </div>
                    </div>
                    
                    <div className="assigned-staff">
                      <h5>Przydzielony personel:</h5>
                      <div className="staff-list">
                        {getStaffByIds(shift.staffIds).map(member => (
                          <div key={member.id} className="assigned-member">
                            <span className="member-name">{member.name}</span>
                            <span className={`member-role ${member.role}`}>
                              {getRoleLabel(member.role)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ManagerStaff;
