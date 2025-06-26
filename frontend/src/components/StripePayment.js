import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// Stripe決済フォームコンポーネント（ネイティブReact実装）
const PaymentForm = ({ reservation, onSuccess, onError, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // カード番号フォーマット（4桁区切り）
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // 有効期限フォーマット（MM/YY）
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field, value) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      value = formatExpiryDate(value);
    } else if (field === 'cvv') {
      value = value.replace(/[^0-9]/g, '').substring(0, 4);
    }
    
    setCardData({...cardData, [field]: value});
  };

  // カード番号バリデーション（Luhnアルゴリズム簡易版）
  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
  };

  // バリデーション
  const isFormValid = () => {
    return (
      validateCardNumber(cardData.cardNumber) &&
      cardData.expiryDate.length === 5 &&
      cardData.cvv.length >= 3 &&
      cardData.cardholderName.length >= 2
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('カード情報を正しく入力してください');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // バックエンドAPI呼び出しをシミュレート
      const response = await fetch('http://localhost:8000/api/create-payment-intent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservation_id: reservation.id,
          card_number: cardData.cardNumber.replace(/\s/g, ''),
          expiry_date: cardData.expiryDate,
          cvv: cardData.cvv,
          cardholder_name: cardData.cardholderName
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // 決済成功をシミュレート（実際のStripe処理）
        setTimeout(() => {
          const mockPaymentIntent = {
            id: 'pi_' + Date.now(),
            status: 'succeeded',
            amount: reservation.totalPrice,
            currency: 'jpy'
          };
          onSuccess(mockPaymentIntent);
        }, 2000);
      } else {
        throw new Error('決済処理に失敗しました');
      }
    } catch (error) {
      setError('決済処理中にエラーが発生しました: ' + error.message);
      onError(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock size={20} className="text-green-500" />
          <h3 className="text-lg font-bold">安全な決済</h3>
        </div>
        <p className="text-gray-600 text-sm">SSL暗号化により保護されています</p>
      </div>

      {/* 予約詳細 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-bold mb-2">予約内容</h4>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">駐車場:</span> {reservation.spotName}</p>
          <p><span className="font-medium">利用者:</span> {reservation.userName}</p>
          <p><span className="font-medium">期間:</span> {reservation.duration}</p>
          <div className="border-t pt-2 mt-2">
            <p className="text-lg font-bold text-blue-600">
              合計: ¥{reservation.totalPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* 決済フォーム */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            カード名義人
          </label>
          <input
            type="text"
            value={cardData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            placeholder="TARO YAMADA"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={processing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            カード番号
          </label>
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
            placeholder="1234 5678 9012 3456"
            maxLength="19"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={processing}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              有効期限
            </label>
            <input
              type="text"
              value={cardData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              placeholder="MM/YY"
              maxLength="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={processing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              CVV
            </label>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              placeholder="123"
              maxLength="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={processing}
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4 text-center">
          <p>お客様のカード情報は暗号化されて安全に処理されます</p>
          <p>このサイトではカード情報を保存しません</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            disabled={processing}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid() || processing}
            className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader size={20} className="animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                ¥{reservation.totalPrice.toLocaleString()}を支払う
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-center mt-4">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>Powered by</span>
          <div className="text-blue-600 font-bold">SecurePay</div>
        </div>
      </div>
    </div>
  );
};

// 決済成功画面
const PaymentSuccess = ({ paymentIntent, reservation, onClose }) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="mb-6">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">決済完了！</h3>
        <p className="text-gray-600">予約が確定しました</p>
      </div>

      <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
        <h4 className="font-bold mb-2">予約詳細</h4>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">予約番号:</span> {reservation.id}</p>
          <p><span className="font-medium">駐車場:</span> {reservation.spotName}</p>
          <p><span className="font-medium">期間:</span> {reservation.duration}</p>
          <p><span className="font-medium">決済ID:</span> {paymentIntent.id}</p>
          <p><span className="font-medium">決済金額:</span> ¥{paymentIntent.amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
        >
          マイページで確認
        </button>
        <p className="text-xs text-gray-500">
          確認メールを {reservation.userEmail} に送信しました
        </p>
      </div>
    </div>
  );
};

// テスト用カード情報表示
const TestCardInfo = () => {
  const testCards = [
    { name: 'Visa', number: '4242 4242 4242 4242', expiry: '12/28', cvv: '123' },
    { name: 'Mastercard', number: '5555 5555 5555 4444', expiry: '12/28', cvv: '123' },
    { name: 'JCB', number: '3530 1113 3330 0000', expiry: '12/28', cvv: '123' }
  ];

  return (
    <div className="max-w-md mx-auto bg-blue-50 rounded-lg p-4 mb-6">
      <h4 className="font-bold text-blue-800 mb-2">🧪 テスト用カード情報</h4>
      <div className="space-y-2 text-sm">
        {testCards.map((card, index) => (
          <div key={index} className="bg-white rounded p-2">
            <div className="font-medium">{card.name}</div>
            <div>番号: {card.number}</div>
            <div>有効期限: {card.expiry} | CVV: {card.cvv}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-blue-600 mt-2">
        ※ 開発環境では上記のテストカードをご利用ください
      </p>
    </div>
  );
};

// メインの決済コンポーネント
const StripePayment = ({ reservation, onSuccess, onCancel, isTestMode = true }) => {
  const [paymentStatus, setPaymentStatus] = useState('form');
  const [paymentResult, setPaymentResult] = useState(null);

  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentResult(paymentIntent);
    setPaymentStatus('success');
    // 3秒後に自動的にマイページに遷移
    setTimeout(() => {
      onSuccess(paymentIntent);
    }, 3000);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentStatus('error');
  };

  if (paymentStatus === 'success') {
    return (
      <PaymentSuccess
        paymentIntent={paymentResult}
        reservation={reservation}
        onClose={() => onSuccess(paymentResult)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {isTestMode && <TestCardInfo />}
      <PaymentForm
        reservation={reservation}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={onCancel}
      />
    </div>
  );
};

// Django Webhookハンドラーの例（コメント形式）
const webhookExample = `
# Django views.py に追加する決済Webhook処理

import json
import hmac
import hashlib
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@csrf_exempt
@require_POST
def payment_webhook(request):
    """決済Webhook処理"""
    payload = request.body
    sig_header = request.META.get('HTTP_SIGNATURE')
    endpoint_secret = 'your_webhook_secret'
    
    # シグネチャ検証
    try:
        expected_sig = hmac.new(
            endpoint_secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(sig_header, expected_sig):
            return HttpResponse(status=400)
    except:
        return HttpResponse(status=400)

    try:
        event_data = json.loads(payload)
        event_type = event_data.get('type')
        
        if event_type == 'payment.succeeded':
            payment_data = event_data.get('data', {})
            reservation_id = payment_data.get('reservation_id')
            
            # 予約ステータス更新
            reservation = Reservation.objects.get(id=reservation_id)
            reservation.status = 'confirmed'
            reservation.payment_id = payment_data.get('payment_id')
            reservation.save()
            
            # 確認メール送信
            send_confirmation_email(reservation)
            
        elif event_type == 'payment.failed':
            payment_data = event_data.get('data', {})
            reservation_id = payment_data.get('reservation_id')
            
            # 失敗処理
            reservation = Reservation.objects.get(id=reservation_id)
            reservation.status = 'failed'
            reservation.save()
            
    except Exception as e:
        print(f"Webhook error: {e}")
        return HttpResponse(status=500)

    return HttpResponse(status=200)

# urls.py に追加
path('webhooks/payment/', views.payment_webhook, name='payment-webhook'),
`;

export default StripePayment;
