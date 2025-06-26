import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, CreditCard, Calendar, User, BarChart3, FileText, Download, Loader } from 'lucide-react';

const CoinParkingSystem = () => {
  const [currentView, setCurrentView] = useState('search');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [adminStats, setAdminStats] = useState({});

  // API設定
  const API_BASE = 'http://localhost:8000';
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_...';

  // 初期データロード
  useEffect(() => {
    loadInitialData();
  }, [currentView, isAdmin]);

  const loadInitialData = () => {
    if (currentView === 'search') {
      searchParkingSpots();
    }
    if (currentView === 'mypage') {
      fetchUserReservations();
    }
    if (isAdmin) {
      fetchAdminStats();
    }
  };

  // API呼び出し関数
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // デモ用のモックデータを返す
      return getMockData(endpoint);
    }
  };

  // デモ用モックデータ
  const getMockData = (endpoint) => {
    if (endpoint.includes('/api/spots/')) {
      return {
        spots: [
          {
            id: '1',
            name: '駅前パーキング',
            address: '東京都渋谷区渋谷1-1-1',
            hourly_rate: 300,
            daily_rate: 2000,
            available: true,
            image_url: 'https://via.placeholder.com/300x200?text=駅前パーキング'
          },
          {
            id: '2',
            name: '商業地区駐車場',
            address: '東京都渋谷区渋谷2-2-2',
            hourly_rate: 250,
            daily_rate: 1800,
            available: true,
            image_url: 'https://via.placeholder.com/300x200?text=商業地区駐車場'
          },
          {
            id: '3',
            name: 'オフィス街パーキング',
            address: '東京都渋谷区渋谷3-3-3',
            hourly_rate: 400,
            daily_rate: 2500,
            available: false,
            image_url: 'https://via.placeholder.com/300x200?text=オフィス街パーキング'
          }
        ]
      };
    }
    return { reservations: [], total_revenue: 45000, total_reservations: 12, total_spots: 3 };
  };

  // 駐車場検索
  const searchParkingSpots = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/api/spots/?search=${encodeURIComponent(searchQuery)}`);
      setParkingSpots(data.spots || []);
    } catch (error) {
      alert('駐車場の検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ユーザー予約履歴取得
  const fetchUserReservations = async () => {
    try {
      const data = await apiCall(`/api/reservations/user/?email=${encodeURIComponent(userEmail)}`);
      setReservations(data.reservations || []);
    } catch (error) {
      console.error('予約履歴の取得に失敗しました');
    }
  };

  // 管理者統計取得
  const fetchAdminStats = async () => {
    try {
      const data = await apiCall('/api/admin/dashboard/');
      setAdminStats(data);
    } catch (error) {
      console.error('管理者データの取得に失敗しました');
    }
  };

  // 予約作成＆決済処理
  const handleReservation = async (spot, startTime, endTime, userName = 'ユーザー') => {
    setLoading(true);
    try {
      // 簡易的な決済完了シミュレーション
      const hours = Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
      const totalPrice = hours * spot.hourly_rate;
      
      const newReservation = {
        id: Date.now().toString(),
        parking_spot: {
          name: spot.name,
          address: spot.address,
          image_url: spot.image_url
        },
        user_email: userEmail,
        user_name: userName,
        start_time: startTime,
        end_time: endTime,
        total_price: totalPrice,
        status: 'confirmed',
        created_at: new Date().toISOString()
      };

      setReservations([newReservation, ...reservations]);
      alert('予約が完了しました！');
      setCurrentView('mypage');
    } catch (error) {
      alert('予約に失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 予約キャンセル
  const cancelReservation = async (reservationId) => {
    if (!confirm('本当にキャンセルしますか？')) return;
    
    try {
      setReservations(reservations.filter(r => r.id !== reservationId));
      alert('キャンセルが完了しました');
    } catch (error) {
      alert('キャンセルに失敗しました: ' + error.message);
    }
  };

  // メイン検索画面
  const SearchView = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">スマートコインパーキング</h1>
        <p className="text-gray-600">お手軽予約・キャッシュレス決済</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="住所・駅名で検索"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && searchParkingSpots()}
            />
          </div>
          <button 
            onClick={searchParkingSpots}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader size={20} className="animate-spin" /> : <Search size={20} />}
            検索
          </button>
        </div>
        
        <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center">
            <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">地図エリア（Google Maps連携予定）</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <Loader size={48} className="animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-500">駐車場を検索中...</p>
          </div>
        ) : parkingSpots.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">駐車場が見つかりませんでした</p>
          </div>
        ) : (
          parkingSpots.map(spot => (
            <div key={spot.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={spot.image_url} alt={spot.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{spot.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                  <MapPin size={16} />
                  {spot.address}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-lg font-bold text-blue-600">¥{spot.hourly_rate}/時間</p>
                    <p className="text-sm text-gray-500">¥{spot.daily_rate}/日</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    spot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {spot.available ? '空きあり' : '満車'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedSpot(spot);
                    setCurrentView('detail');
                  }}
                  disabled={!spot.available}
                  className={`w-full py-2 rounded-lg font-medium ${
                    spot.available 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {spot.available ? '詳細・予約' : '満車'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // 詳細・予約画面
  const DetailView = () => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [userName, setUserName] = useState('');
    
    if (!selectedSpot) return null;

    const calculatePrice = () => {
      if (!startTime || !endTime) return 0;
      const hours = Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
      return Math.max(0, hours * selectedSpot.hourly_rate);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button 
          onClick={() => setCurrentView('search')}
          className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
        >
          ← 検索に戻る
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img src={selectedSpot.image_url} alt={selectedSpot.name} className="w-full h-64 object-cover" />
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{selectedSpot.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 mb-2 flex items-center gap-2">
                  <MapPin size={18} />
                  {selectedSpot.address}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">料金</h3>
                  <p>時間料金: ¥{selectedSpot.hourly_rate}/時間</p>
                  <p>日額料金: ¥{selectedSpot.daily_rate}/日</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">利用者名</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="お名前を入力"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">開始日時</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">終了日時</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {startTime && endTime && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-800">料金計算</h3>
                    <p className="text-blue-700">合計: ¥{calculatePrice()}</p>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    if (startTime && endTime && calculatePrice() > 0 && userName.trim()) {
                      handleReservation(selectedSpot, startTime, endTime, userName);
                    }
                  }}
                  disabled={!startTime || !endTime || calculatePrice() <= 0 || !userName.trim() || loading}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader size={20} className="animate-spin" /> : <CreditCard size={20} />}
                  予約・決済に進む
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // マイページ
  const MyPageView = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <User size={24} />
        マイページ
      </h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">予約履歴</h3>
        {reservations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">予約履歴がありません</p>
        ) : (
          <div className="space-y-4">
            {reservations.map(reservation => (
              <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{reservation.parking_spot.name}</h4>
                    <p className="text-gray-600 text-sm">{reservation.parking_spot.address}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(reservation.start_time).toLocaleString()} - {new Date(reservation.end_time).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">¥{reservation.total_price}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      reservation.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : reservation.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.status === 'confirmed' ? '予約確定' : 
                       reservation.status === 'cancelled' ? 'キャンセル済み' : 
                       reservation.status}
                    </span>
                    {reservation.status === 'confirmed' && (
                      <button
                        onClick={() => cancelReservation(reservation.id)}
                        className="block mt-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        キャンセル
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // 管理画面
  const AdminView = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">管理者ダッシュボード</h2>
        <button
          onClick={() => setIsAdmin(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ユーザー画面に戻る
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-500" size={24} />
            <div>
              <h3 className="font-bold">今月の売上</h3>
              <p className="text-2xl font-bold text-blue-600">¥{(adminStats.total_revenue || 45000).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <Calendar className="text-green-500" size={24} />
            <div>
              <h3 className="font-bold">総予約数</h3>
              <p className="text-2xl font-bold text-green-600">{adminStats.total_reservations || 12}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <MapPin className="text-purple-500" size={24} />
            <div>
              <h3 className="font-bold">駐車場数</h3>
              <p className="text-2xl font-bold text-purple-600">{adminStats.total_spots || 3}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">予約一覧</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => window.open(`${API_BASE}/api/admin/export/csv/`, '_blank')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Download size={16} />
              CSV出力
            </button>
            <button 
              onClick={() => window.open(`${API_BASE}/api/admin/export/pdf/`, '_blank')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
            >
              <FileText size={16} />
              PDF出力
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">予約ID</th>
                <th className="text-left p-2">駐車場名</th>
                <th className="text-left p-2">利用者</th>
                <th className="text-left p-2">開始時間</th>
                <th className="text-left p-2">終了時間</th>
                <th className="text-left p-2">料金</th>
                <th className="text-left p-2">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => (
                <tr key={reservation.id} className="border-b">
                  <td className="p-2">#{reservation.id.slice(0, 8)}</td>
                  <td className="p-2">{reservation.parking_spot?.name || 'N/A'}</td>
                  <td className="p-2">{reservation.user_email}</td>
                  <td className="p-2">{new Date(reservation.start_time).toLocaleString()}</td>
                  <td className="p-2">{new Date(reservation.end_time).toLocaleString()}</td>
                  <td className="p-2">¥{reservation.total_price}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.status === 'confirmed' ? '確定' : 
                       reservation.status === 'cancelled' ? 'キャンセル' : 
                       reservation.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-blue-600">コインパーキング</h1>
              {!isAdmin && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentView('search')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'search' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    駐車場検索
                  </button>
                  <button
                    onClick={() => setCurrentView('mypage')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'mypage' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    マイページ
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
            >
              {isAdmin ? 'ユーザー画面' : '管理者画面'}
            </button>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin ? (
          <AdminView />
        ) : (
          <>
            {currentView === 'search' && <SearchView />}
            {currentView === 'detail' && <DetailView />}
            {currentView === 'mypage' && <MyPageView />}
          </>
        )}
      </main>
    </div>
  );
};

export default CoinParkingSystem;
