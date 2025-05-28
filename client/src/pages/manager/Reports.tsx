import { useState } from 'react';
import ManagerHeader from '../../components/manager/ManagerHeader';
import ManagerSidebar from '../../components/manager/ManagerSidebar';
import '../../styles/manager/Reports.css';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

interface PopularItem {
  name: string;
  orders: number;
  revenue: number;
  type: 'dish' | 'drink';
}

function ManagerReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedReport, setSelectedReport] = useState('sales');

  // Mock data for reports
  const salesData: SalesData[] = [
    { date: '2025-05-22', revenue: 1250.80, orders: 32, avgOrderValue: 39.09 },
    { date: '2025-05-23', revenue: 1485.20, orders: 38, avgOrderValue: 39.08 },
    { date: '2025-05-24', revenue: 1680.50, orders: 42, avgOrderValue: 40.01 },
    { date: '2025-05-25', revenue: 1890.75, orders: 47, avgOrderValue: 40.23 },
    { date: '2025-05-26', revenue: 2120.30, orders: 52, avgOrderValue: 40.78 },
    { date: '2025-05-27', revenue: 2340.80, orders: 58, avgOrderValue: 40.36 },
    { date: '2025-05-28', revenue: 1950.40, orders: 48, avgOrderValue: 40.63 }
  ];

  const popularItems: PopularItem[] = [
    { name: 'Pizza Margherita', orders: 45, revenue: 1125.00, type: 'dish' },
    { name: 'Spaghetti Carbonara', orders: 38, revenue: 836.00, type: 'dish' },
    { name: 'Coca Cola', orders: 67, revenue: 335.00, type: 'drink' },
    { name: 'Steak Wołowy', orders: 22, revenue: 1430.00, type: 'dish' },
    { name: 'Piwo', orders: 54, revenue: 324.00, type: 'drink' },
    { name: 'Tiramisu', orders: 28, revenue: 420.00, type: 'dish' },
    { name: 'Wino białe', orders: 18, revenue: 630.00, type: 'drink' }
  ];

  const getTotalRevenue = () => {
    return salesData.reduce((sum, day) => sum + day.revenue, 0);
  };

  const getTotalOrders = () => {
    return salesData.reduce((sum, day) => sum + day.orders, 0);
  };

  const getAverageOrderValue = () => {
    const totalRevenue = getTotalRevenue();
    const totalOrders = getTotalOrders();
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
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
          <h1>Raporty i Statystyki</h1>
          
          <div className="reports-controls">
            <div className="period-selector">
              <label>Okres:</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="day">Dzisiaj</option>
                <option value="week">Ten tydzień</option>
                <option value="month">Ten miesiąc</option>
                <option value="quarter">Ten kwartał</option>
              </select>
            </div>
            
            <div className="report-selector">
              <label>Raport:</label>
              <select 
                value={selectedReport} 
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                <option value="sales">Sprzedaż</option>
                <option value="popular">Popularne pozycje</option>
                <option value="performance">Wydajność</option>
              </select>
            </div>
          </div>

          {selectedReport === 'sales' && (
            <div className="sales-report">
              <div className="summary-cards">
                <div className="summary-card revenue">
                  <h3>Łączny przychód</h3>
                  <p className="big-number">{formatCurrency(getTotalRevenue())}</p>
                  <small>Ostatnie 7 dni</small>
                </div>
                
                <div className="summary-card orders">
                  <h3>Liczba zamówień</h3>
                  <p className="big-number">{getTotalOrders()}</p>
                  <small>Ostatnie 7 dni</small>
                </div>
                
                <div className="summary-card avg-order">
                  <h3>Średnia wartość zamówienia</h3>
                  <p className="big-number">{formatCurrency(getAverageOrderValue())}</p>
                  <small>Ostatnie 7 dni</small>
                </div>
              </div>
              
              <div className="daily-breakdown">
                <h3>Rozbicie dzienne</h3>
                <div className="sales-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Przychód</th>
                        <th>Zamówienia</th>
                        <th>Śr. wartość</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((day, index) => (
                        <tr key={index}>
                          <td>{formatDate(day.date)}</td>
                          <td className="revenue">{formatCurrency(day.revenue)}</td>
                          <td className="orders">{day.orders}</td>
                          <td className="avg">{formatCurrency(day.avgOrderValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'popular' && (
            <div className="popular-report">
              <h3>Najpopularniejsze pozycje</h3>
              <div className="popular-items">
                {popularItems.map((item, index) => (
                  <div key={index} className={`popular-item ${item.type}`}>
                    <div className="item-rank">#{index + 1}</div>
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <span className="item-type">{item.type === 'dish' ? 'Danie' : 'Napój'}</span>
                    </div>
                    <div className="item-stats">
                      <div className="stat">
                        <span className="label">Zamówienia:</span>
                        <span className="value">{item.orders}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Przychód:</span>
                        <span className="value">{formatCurrency(item.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === 'performance' && (
            <div className="performance-report">
              <h3>Wydajność restauracji</h3>
              
              <div className="performance-metrics">
                <div className="metric-card">
                  <h4>Średni czas przygotowania</h4>
                  <p className="metric-value">18 min</p>
                  <span className="metric-trend good">↓ 2 min w porównaniu do zeszłego tygodnia</span>
                </div>
                
                <div className="metric-card">
                  <h4>Wskaźnik zadowolenia</h4>
                  <p className="metric-value">4.7/5</p>
                  <span className="metric-trend good">↑ 0.2 w porównaniu do zeszłego miesiąca</span>
                </div>
                
                <div className="metric-card">
                  <h4>Anulowane zamówienia</h4>
                  <p className="metric-value">2.1%</p>
                  <span className="metric-trend good">↓ 0.5% w porównaniu do zeszłego tygodnia</span>
                </div>
                
                <div className="metric-card">
                  <h4>Wykorzystanie stołów</h4>
                  <p className="metric-value">78%</p>
                  <span className="metric-trend neutral">= bez zmian</span>
                </div>
              </div>
              
              <div className="staff-performance">
                <h4>Wydajność personelu</h4>
                <div className="staff-stats">
                  <div className="staff-member">
                    <span className="name">Anna Kowalski (Kucharz)</span>
                    <span className="performance">Średni czas: 16 min</span>
                    <span className="rating good">Bardzo dobra</span>
                  </div>
                  <div className="staff-member">
                    <span className="name">Piotr Nowak (Kelner)</span>
                    <span className="performance">Obsłużone zamówienia: 45</span>
                    <span className="rating good">Dobra</span>
                  </div>
                  <div className="staff-member">
                    <span className="name">Maria Wiśniewska (Kucharz)</span>
                    <span className="performance">Średni czas: 20 min</span>
                    <span className="rating average">Średnia</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ManagerReports;
