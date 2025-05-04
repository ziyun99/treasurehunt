import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { isAdmin } from '../utils/admin';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [helperFilter, setHelperFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageInput, setPageInput] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  // Get unique values for dropdowns
  const uniqueLocations = [...new Set(users.map(user => user.location).filter(Boolean))].sort();
  const uniqueHelpers = [...new Set(users.map(user => user.helper).filter(Boolean))].sort();

  const clearFilters = () => {
    setNameFilter('');
    setEmailFilter('');
    setLocationFilter('');
    setHelperFilter('');
    setSortField('name');
    setSortDirection('asc');
    setCurrentPage(1);
    setPageInput('');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const adminStatus = await isAdmin(user.uid);
        if (!adminStatus) {
          navigate('/');
          return;
        }

        setCurrentAdmin({
          name: user.displayName || '未設定',
          email: user.email,
          uid: user.uid,
          role: '管理員'
        });

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const nameMatch = !nameFilter || 
        (user.name && user.name.toLowerCase().includes(nameFilter.toLowerCase()));
      const emailMatch = !emailFilter || 
        (user.email && user.email.toLowerCase().includes(emailFilter.toLowerCase()));
      const locationMatch = !locationFilter || 
        (user.location === locationFilter);
      const helperMatch = !helperFilter || 
        (user.helper === helperFilter);
      return nameMatch && emailMatch && locationMatch && helperMatch;
    })
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }
      
      return String(aValue).localeCompare(String(bValue)) * direction;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setPageInput('');
    }
  };

  const handlePageInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    if (pageInput) {
      const page = parseInt(pageInput);
      if (page >= 1 && page <= totalPages) {
        handlePageChange(page);
      }
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageInput('');
  }, [nameFilter, emailFilter, locationFilter, helperFilter, sortField, sortDirection]);

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return '-';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const formatProgress = (progress) => {
    if (!progress) return '-';
    const landmarkCount = progress.landmark ? Object.values(progress.landmark).filter(Boolean).length : 0;
    const diamondCount = progress.diamond ? Object.values(progress.diamond).filter(Boolean).length : 0;
    return `宝箱: ${landmarkCount}/7 | 钻石: ${diamondCount}/3`;
  };

  // Calculate analytics
  const calculateAnalytics = () => {
    const totalUsers = users.length;
    const usersByLocation = users.reduce((acc, user) => {
      const location = user.location || '未設定';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    const usersByHelper = users.reduce((acc, user) => {
      const helper = user.helper || '未設定';
      acc[helper] = (acc[helper] || 0) + 1;
      return acc;
    }, {});

    const totalDiamondPoints = users.reduce((sum, user) => sum + (user.diamondPoints || 0), 0);
    const averageDiamondPoints = totalUsers > 0 ? (totalDiamondPoints / totalUsers).toFixed(1) : 0;

    // Calculate progress statistics
    const progressStats = {
      landmarks: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
      diamonds: { 0: 0, 1: 0, 2: 0, 3: 0 }
    };

    users.forEach(user => {
      const landmarkCount = user.progress?.landmark 
        ? Object.values(user.progress.landmark).filter(Boolean).length 
        : 0;
      const diamondCount = user.progress?.diamond 
        ? Object.values(user.progress.diamond).filter(Boolean).length 
        : 0;
      
      progressStats.landmarks[landmarkCount]++;
      progressStats.diamonds[diamondCount]++;
    });

    // Calculate completion rates
    const completedAllLandmarks = users.filter(user => {
      if (!user.progress?.landmark) return false;
      return Object.values(user.progress.landmark).every(Boolean);
    }).length;

    const completedAllDiamonds = users.filter(user => {
      if (!user.progress?.diamond) return false;
      return Object.values(user.progress.diamond).every(Boolean);
    }).length;

    // Calculate activity by time
    const activityByHour = Array(24).fill(0);
    users.forEach(user => {
      if (user.lastCheckIn?.seconds) {
        const hour = new Date(user.lastCheckIn.seconds * 1000).getHours();
        activityByHour[hour]++;
      }
    });

    // Calculate diamond points distribution
    const diamondPointsRanges = {
      '0-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41+': 0
    };

    users.forEach(user => {
      const points = user.diamondPoints || 0;
      if (points <= 10) diamondPointsRanges['0-10']++;
      else if (points <= 20) diamondPointsRanges['11-20']++;
      else if (points <= 30) diamondPointsRanges['21-30']++;
      else if (points <= 40) diamondPointsRanges['31-40']++;
      else diamondPointsRanges['41+']++;
    });

    // Calculate completion timeline
    const completionTimeline = {};
    users.forEach(user => {
      if (user.lastCheckIn?.seconds) {
        const date = new Date(user.lastCheckIn.seconds * 1000);
        const dateStr = date.toISOString().split('T')[0];
        if (!completionTimeline[dateStr]) {
          completionTimeline[dateStr] = {
            total: 0,
            completed: 0
          };
        }
        completionTimeline[dateStr].total++;
        if (user.progress?.landmark && Object.values(user.progress.landmark).every(Boolean)) {
          completionTimeline[dateStr].completed++;
        }
      }
    });

    // Calculate achievement correlation
    const achievementCorrelation = {
      labels: ['0-10', '11-20', '21-30', '31-40', '41+'],
      datasets: [{
        label: '寶箱完成率',
        data: Object.entries(diamondPointsRanges).map(([range, count]) => {
          const usersInRange = users.filter(user => {
            const points = user.diamondPoints || 0;
            const rangeNum = parseInt(range.split('-')[0]);
            return points >= rangeNum && (range === '41+' || points <= parseInt(range.split('-')[1]));
          });
          const completedCount = usersInRange.filter(user => 
            user.progress?.landmark && Object.values(user.progress.landmark).every(Boolean)
          ).length;
          return ((completedCount / count) * 100).toFixed(1);
        }),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    // Calculate engagement score
    const engagementScores = users.map(user => {
      let score = 0;
      if (user.progress?.landmark) {
        score += Object.values(user.progress.landmark).filter(Boolean).length * 10;
      }
      if (user.progress?.diamond) {
        score += Object.values(user.progress.diamond).filter(Boolean).length * 15;
      }
      score += (user.diamondPoints || 0) * 2;
      return score;
    });

    const engagementDistribution = {
      labels: ['0-50', '51-100', '101-150', '151-200', '201+'],
      datasets: [{
        label: '用戶數量',
        data: [0, 0, 0, 0, 0]
      }]
    };

    engagementScores.forEach(score => {
      if (score <= 50) engagementDistribution.datasets[0].data[0]++;
      else if (score <= 100) engagementDistribution.datasets[0].data[1]++;
      else if (score <= 150) engagementDistribution.datasets[0].data[2]++;
      else if (score <= 200) engagementDistribution.datasets[0].data[3]++;
      else engagementDistribution.datasets[0].data[4]++;
    });

    // Calculate completion rate by location
    const completionByLocation = {};
    Object.keys(usersByLocation).forEach(location => {
      const usersInLocation = users.filter(user => user.location === location);
      const completedCount = usersInLocation.filter(user => 
        user.progress?.landmark && Object.values(user.progress.landmark).every(Boolean)
      ).length;
      completionByLocation[location] = {
        total: usersInLocation.length,
        completed: completedCount,
        rate: ((completedCount / usersInLocation.length) * 100).toFixed(1)
      };
    });

    // Prepare data for charts
    const locationChartData = {
      labels: Object.keys(usersByLocation),
      datasets: [{
        data: Object.values(usersByLocation),
        backgroundColor: [
          '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B',
          '#10B981', '#3B82F6', '#A855F7', '#D946EF', '#F472B6'
        ]
      }]
    };

    const helperChartData = {
      labels: Object.keys(usersByHelper),
      datasets: [{
        data: Object.values(usersByHelper),
        backgroundColor: [
          '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B',
          '#10B981', '#3B82F6', '#A855F7', '#D946EF', '#F472B6'
        ]
      }]
    };

    const progressChartData = {
      labels: Object.keys(progressStats.landmarks).map(count => `${count} 個寶箱`),
      datasets: [{
        label: '用戶數量',
        data: Object.values(progressStats.landmarks),
        backgroundColor: '#6366F1'
      }]
    };

    const activityChartData = {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        label: '活躍用戶數',
        data: activityByHour,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    const diamondPointsChartData = {
      labels: Object.keys(diamondPointsRanges),
      datasets: [{
        label: '用戶數量',
        data: Object.values(diamondPointsRanges),
        backgroundColor: '#F59E0B'
      }]
    };

    return {
      totalUsers,
      usersByLocation,
      usersByHelper,
      totalDiamondPoints,
      averageDiamondPoints,
      progressStats,
      completedAllLandmarks,
      completedAllDiamonds,
      activityByHour,
      diamondPointsRanges,
      charts: {
        location: locationChartData,
        helper: helperChartData,
        progress: progressChartData,
        activity: activityChartData,
        diamondPoints: diamondPointsChartData,
        timeline: {
          labels: Object.keys(completionTimeline),
          datasets: [{
            label: '完成率',
            data: Object.values(completionTimeline).map(({completed, total}) => 
              ((completed / total) * 100).toFixed(1)
            ),
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        correlation: achievementCorrelation,
        engagement: engagementDistribution,
        locationCompletion: {
          labels: Object.keys(completionByLocation),
          datasets: [{
            label: '完成率 (%)',
            data: Object.values(completionByLocation).map(data => data.rate),
            backgroundColor: '#6366F1'
          }]
        }
      }
    };
  };

  const analytics = calculateAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              返回首頁
            </button>
            <h1 className="text-2xl font-bold text-gray-800">管理員面板</h1>
          </div>
          <div className="text-center text-gray-600">載入中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              返回首頁
            </button>
            <h1 className="text-2xl font-bold text-gray-800">管理員面板</h1>
          </div>
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto text-center"
          >
            返回首頁
          </button>
          <h1 className="text-2xl font-bold text-gray-800 text-center sm:text-left">管理員面板</h1>
        </div>

        {/* Admin Info Section */}
        {currentAdmin && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-1">
                <div className="text-sm text-gray-500 font-medium">姓名</div>
                <div className="text-lg font-semibold text-gray-800">{currentAdmin.name}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500 font-medium">Email</div>
                <div className="text-lg font-semibold text-gray-800 break-all">{currentAdmin.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500 font-medium">UID</div>
                <div className="text-lg font-semibold text-gray-800 break-all">{currentAdmin.uid}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500 font-medium">角色</div>
                <div className="text-lg font-semibold text-indigo-600">{currentAdmin.role}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                用戶列表
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                數據分析
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' ? (
          <>
            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">篩選條件</h2>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  清除篩選
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <input
                    type="text"
                    placeholder="輸入姓名..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="text"
                    placeholder="輸入Email..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地區</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">所有地區</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">小幫手</label>
                  <select
                    value={helperFilter}
                    onChange={(e) => setHelperFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">所有小幫手</option>
                    {uniqueHelpers.map(helper => (
                      <option key={helper} value={helper}>{helper}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      {[
                        { field: 'name', label: '姓名' },
                        { field: 'email', label: 'Email' },
                        { field: 'location', label: '地區' },
                        { field: 'helper', label: '小幫手' },
                        { field: 'diamondPoints', label: '鑽石點數' },
                        { field: 'progress', label: '進度' },
                        { field: 'lastCheckIn', label: '最後簽到' },
                        { field: 'lastDiamondUpdated', label: '最後更新' }
                      ].map(({ field, label }) => (
                        <th
                          key={field}
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort(field)}
                        >
                          <div className="flex items-center gap-1">
                            {label}
                            {sortField === field && (
                              <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name || '-'}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 break-all">{user.email || '-'}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.location || '-'}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.helper || '-'}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.diamondPoints || 0}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatProgress(user.progress)}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(user.lastCheckIn)}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(user.lastDiamondUpdated)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                        每頁顯示
                      </label>
                      <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-700">
                      顯示第 <span className="font-medium">{indexOfFirstItem + 1}</span> 到{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredAndSortedUsers.length)}
                      </span>{' '}
                      筆，共 <span className="font-medium">{filteredAndSortedUsers.length}</span> 筆
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                      <label htmlFor="pageInput" className="text-sm text-gray-700">
                        跳至
                      </label>
                      <input
                        type="text"
                        id="pageInput"
                        value={pageInput}
                        onChange={handlePageInputChange}
                        className="w-16 rounded-md border-gray-300 py-1 px-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="頁碼"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        確定
                      </button>
                    </form>

                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">上一頁</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">下一頁</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="text-sm text-indigo-600 font-medium">總用戶數</div>
                <div className="text-2xl font-bold text-indigo-900">{analytics.totalUsers}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-600 font-medium">總鑽石點數</div>
                <div className="text-2xl font-bold text-yellow-900">{analytics.totalDiamondPoints}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">平均鑽石點數</div>
                <div className="text-2xl font-bold text-green-900">{analytics.averageDiamondPoints}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">完成所有寶箱</div>
                <div className="text-2xl font-bold text-purple-900">
                  {analytics.completedAllLandmarks} ({((analytics.completedAllLandmarks / analytics.totalUsers) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>

            {/* Progress Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">寶箱完成進度</h3>
                <div className="h-64">
                  <Bar
                    data={analytics.charts.progress}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.raw;
                              const total = analytics.totalUsers;
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${value} 人 (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">鑽石完成進度</h3>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: Object.keys(analytics.progressStats.diamonds).map(count => `${count} 個鑽石`),
                      datasets: [{
                        label: '用戶數量',
                        data: Object.values(analytics.progressStats.diamonds),
                        backgroundColor: '#10B981'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.raw;
                              const total = analytics.totalUsers;
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${value} 人 (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* User Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">地區分布</h3>
                <div className="h-64">
                  <Pie
                    data={analytics.charts.location}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            boxWidth: 12,
                            padding: 15
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">小幫手分布</h3>
                <div className="h-64">
                  <Pie
                    data={analytics.charts.helper}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            boxWidth: 12,
                            padding: 15
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">活躍時段分布</h3>
                <div className="h-64">
                  <Line
                    data={analytics.charts.activity}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">完成率時間線</h3>
                <div className="h-64">
                  <Line
                    data={analytics.charts.timeline}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: value => `${value}%`
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">鑽石點數與完成率關聯</h3>
                <div className="h-64">
                  <Line
                    data={analytics.charts.correlation}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: value => `${value}%`
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">用戶參與度分布</h3>
                <div className="h-64">
                  <Bar
                    data={analytics.charts.engagement}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">地區完成率比較</h3>
                <div className="h-64">
                  <Bar
                    data={analytics.charts.locationCompletion}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: value => `${value}%`
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 