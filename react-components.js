/**
 * ============================================
 * WASTE2WORTH - REACT COMPONENTS
 * ============================================
 */

'use strict';

const e = React.createElement;

// ============================================
// PAYMENT GATEWAY COMPONENT
// ============================================

function PaymentGateway({ amount, listing, onSuccess, onCancel }) {
  const [processing, setProcessing] = React.useState(false);
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiry, setExpiry] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [error, setError] = React.useState('');

  const handlePayment = () => {
    // Validation
    if (!cardNumber || !expiry || !cvv) {
      setError('Please fill in all payment details');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Invalid card number');
      return;
    }

    setError('');
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onSuccess({
        transactionId: 'TXN' + Date.now(),
        amount: amount,
        timestamp: new Date().toISOString()
      });
    }, 2500);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  return e('div', { style: { padding: '24px' } },
    e('div', { style: { marginBottom: '24px', textAlign: 'center' } },
      e('div', { style: { 
        fontSize: '32px', 
        fontWeight: '700', 
        color: 'var(--color-primary)',
        marginBottom: '8px'
      } }, `₹${amount.toLocaleString()}`),
      listing && e('div', { style: { 
        fontSize: '14px', 
        color: 'var(--color-text-secondary)' 
      } }, `Payment for ${listing.material}`)
    ),

    e('div', { style: { 
      background: 'var(--color-secondary)', 
      padding: '16px', 
      borderRadius: '8px',
      marginBottom: '24px'
    } },
      e('div', { style: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      } },
        e('svg', { width: '20', height: '20', viewBox: '0 0 20 20', fill: 'none' },
          e('path', { 
            d: 'M10 2C14.4 2 18 5.6 18 10C18 14.4 14.4 18 10 18C5.6 18 2 14.4 2 10C2 5.6 5.6 2 10 2Z',
            stroke: 'var(--color-success)',
            strokeWidth: '2',
            fill: 'none'
          }),
          e('path', { 
            d: 'M8 10L9.5 11.5L13 8',
            stroke: 'var(--color-success)',
            strokeWidth: '2',
            strokeLinecap: 'round'
          })
        ),
        'Secure payment powered by Waste2Worth Escrow'
      )
    ),

    error && e('div', { style: { 
      background: 'rgba(192, 21, 47, 0.1)', 
      color: 'var(--color-error)',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px'
    } }, error),

    e('div', { className: 'form-group' },
      e('label', { className: 'form-label' }, 'Card Number'),
      e('input', { 
        type: 'text',
        className: 'form-control',
        placeholder: '1234 5678 9012 3456',
        value: cardNumber,
        maxLength: '19',
        onChange: (ev) => setCardNumber(formatCardNumber(ev.target.value)),
        disabled: processing
      })
    ),

    e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
      e('div', { className: 'form-group' },
        e('label', { className: 'form-label' }, 'Expiry Date'),
        e('input', { 
          type: 'text',
          className: 'form-control',
          placeholder: 'MM/YY',
          value: expiry,
          maxLength: '5',
          onChange: (ev) => {
            let value = ev.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
              value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            setExpiry(value);
          },
          disabled: processing
        })
      ),
      e('div', { className: 'form-group' },
        e('label', { className: 'form-label' }, 'CVV'),
        e('input', { 
          type: 'text',
          className: 'form-control',
          placeholder: '123',
          value: cvv,
          maxLength: '3',
          onChange: (ev) => setCvv(ev.target.value.replace(/\D/g, '')),
          disabled: processing
        })
      )
    ),

    e('div', { style: { display: 'flex', gap: '12px', marginTop: '24px' } },
      e('button', {
        className: 'btn btn--outline',
        onClick: onCancel,
        disabled: processing,
        style: { flex: 1 }
      }, 'Cancel'),
      e('button', {
        className: 'btn btn--primary',
        onClick: handlePayment,
        disabled: processing,
        style: { flex: 2 }
      }, processing ? 'Processing...' : 'Pay Now')
    )
  );
}

// ============================================
// IMPACT DASHBOARD COMPONENT
// ============================================

function ImpactDashboard({ stats }) {
  return e('div', { className: 'grid grid--3' },
    e('div', { className: 'card card--success' },
      e('div', { className: 'card__body' },
        e('div', { className: 'impact-stat' },
          e('div', { className: 'impact-stat__icon' },
            e('svg', { width: '40', height: '40', viewBox: '0 0 40 40', fill: 'none' },
              e('path', { 
                d: 'M20 8L28 16L20 24L12 16L20 8Z', 
                fill: 'var(--color-success)' 
              })
            )
          ),
          e('div', { className: 'impact-stat__content' },
            e('div', { className: 'impact-stat__value' }, stats.wasteDiverted || '0'),
            e('div', { className: 'impact-stat__label' }, 'Tons Diverted from Landfill')
          )
        )
      )
    ),
    e('div', { className: 'card card--primary' },
      e('div', { className: 'card__body' },
        e('div', { className: 'impact-stat' },
          e('div', { className: 'impact-stat__icon' },
            e('svg', { width: '40', height: '40', viewBox: '0 0 40 40', fill: 'none' },
              e('circle', { 
                cx: '20', 
                cy: '20', 
                r: '12', 
                fill: 'var(--color-primary)' 
              })
            )
          ),
          e('div', { className: 'impact-stat__content' },
            e('div', { className: 'impact-stat__value' }, stats.co2Savings || '0'),
            e('div', { className: 'impact-stat__label' }, 'kg CO₂ Emissions Prevented')
          )
        )
      )
    ),
    e('div', { className: 'card card--info' },
      e('div', { className: 'card__body' },
        e('div', { className: 'impact-stat' },
          e('div', { className: 'impact-stat__icon' },
            e('svg', { width: '40', height: '40', viewBox: '0 0 40 40', fill: 'none' },
              e('path', { 
                d: 'M20 10L26 16L20 22L14 16L20 10Z', 
                fill: 'var(--color-info)' 
              })
            )
          ),
          e('div', { className: 'impact-stat__content' },
            e('div', { className: 'impact-stat__value' }, stats.virginMaterial || '0'),
            e('div', { className: 'impact-stat__label' }, 'kg Virgin Material Replaced')
          )
        )
      )
    )
  );
}

// ============================================
// LIVE CHAT COMPONENT
// ============================================

function LiveChat({ negotiationId, messages, onSendMessage }) {
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(negotiationId, newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      handleSend();
    }
  };

  return e('div', { className: 'negotiation-card' },
    e('div', { className: 'negotiation-card__messages', style: { maxHeight: '400px' } },
      messages.map((msg, index) =>
        e('div', { key: index, className: 'message' },
          e('div', { className: 'message__sender' }, msg.sender),
          e('div', { className: 'message__text' }, msg.text),
          msg.timestamp && e('div', { 
            style: { 
              fontSize: '11px', 
              color: 'var(--color-text-secondary)', 
              marginTop: '4px' 
            } 
          }, new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
          }))
        )
      ),
      e('div', { ref: messagesEndRef })
    ),
    e('div', { style: { display: 'flex', gap: '8px', marginTop: '16px' } },
      e('input', {
        type: 'text',
        className: 'form-control',
        placeholder: 'Type your message...',
        value: newMessage,
        onChange: (ev) => setNewMessage(ev.target.value),
        onKeyPress: handleKeyPress
      }),
      e('button', {
        className: 'btn btn--primary',
        onClick: handleSend
      },
        e('svg', { width: '16', height: '16', viewBox: '0 0 16 16', fill: 'none' },
          e('path', { d: 'M2 8L14 2L8 14L6 9L2 8Z', fill: 'currentColor' })
        )
      )
    )
  );
}

// ============================================
// ESCROW STATUS COMPONENT
// ============================================

function EscrowStatus({ transaction }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'var(--color-warning)';
      case 'in_escrow': return 'var(--color-info)';
      case 'released': return 'var(--color-success)';
      default: return 'var(--color-text-secondary)';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'in_escrow':
        return e('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none' },
          e('path', { 
            d: 'M12 2L18 6V10C18 14 15 18 12 20C9 18 6 14 6 10V6L12 2Z',
            stroke: getStatusColor(status),
            strokeWidth: '2',
            fill: 'none'
          })
        );
      case 'released':
        return e('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none' },
          e('path', { 
            d: 'M9 12L11 14L15 10',
            stroke: getStatusColor(status),
            strokeWidth: '2',
            strokeLinecap: 'round'
          })
        );
      default:
        return e('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none' },
          e('circle', { 
            cx: '12', 
            cy: '12', 
            r: '8',
            stroke: getStatusColor(status),
            strokeWidth: '2',
            fill: 'none'
          })
        );
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'in_escrow': return 'Funds Secured in Escrow';
      case 'released': return 'Payment Released';
      case 'pending': return 'Pending Confirmation';
      default: return 'Unknown Status';
    }
  };

  const getStatusDescription = (status) => {
    switch(status) {
      case 'in_escrow':
        return 'Payment held securely until material validation is completed';
      case 'released':
        return 'Transaction completed successfully. Funds transferred to seller.';
      case 'pending':
        return 'Awaiting payment confirmation and escrow setup';
      default:
        return '';
    }
  };

  return e('div', { 
    className: 'card',
    style: { borderLeft: `4px solid ${getStatusColor(transaction.status)}` }
  },
    e('div', { className: 'card__body' },
      e('h4', { style: { marginBottom: '16px' } }, 'Escrow Protection'),
      e('div', { 
        style: { 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: '12px'
        } 
      },
        e('div', { 
          style: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: `${getStatusColor(transaction.status)}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, getStatusIcon(transaction.status)),
        e('div', null,
          e('div', { 
            style: { 
              fontWeight: '600',
              fontSize: '16px',
              marginBottom: '4px'
            } 
          }, getStatusText(transaction.status)),
          e('div', { 
            style: { 
              fontSize: '13px',
              color: 'var(--color-text-secondary)'
            } 
          }, getStatusDescription(transaction.status))
        )
      ),
      transaction.amount && e('div', { 
        style: { 
          marginTop: '16px',
          padding: '12px',
          background: 'var(--color-secondary)',
          borderRadius: '6px',
          fontSize: '14px'
        } 
      },
        e('div', { style: { marginBottom: '4px', color: 'var(--color-text-secondary)' } }, 'Amount'),
        e('div', { style: { fontSize: '20px', fontWeight: '600', color: 'var(--color-primary)' } }, 
          `₹${transaction.amount.toLocaleString()}`
        )
      )
    )
  );
}

// ============================================
// EXPORT COMPONENTS
// ============================================

window.PaymentGateway = PaymentGateway;
window.ImpactDashboard = ImpactDashboard;
window.LiveChat = LiveChat;
window.EscrowStatus = EscrowStatus;

console.log('✅ Waste2Worth React Components Loaded');
