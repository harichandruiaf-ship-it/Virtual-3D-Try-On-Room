/**
 * Embeddable script for e-commerce sites.
 * Usage: Add script tag, then TryOnRoom.init({ apiKey, container, productId?, variantId? })
 */
(function () {
  var script = document.currentScript;
  var baseUrl = script && script.src ? script.src.replace(/\/embed\.js.*$/, '') : '';

  function openTryOnRoom(opts) {
    var sessionId = opts.sessionId || '';
    var productId = opts.productId || '';
    var variantId = opts.variantId || '';
    var params = new URLSearchParams();
    if (sessionId) params.set('session_id', sessionId);
    if (productId) params.set('product_id', productId);
    if (variantId) params.set('variant_id', variantId);
    var url = baseUrl + '/room' + (params.toString() ? '?' + params.toString() : '');
    if (opts.openInNewTab) {
      window.open(url, '_blank', 'noopener');
    } else {
      window.location.href = url;
    }
  }

  function createButton(container, opts) {
    var el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = opts.buttonText || 'Try on';
    btn.className = opts.buttonClass || 'tryon-room-btn';
    btn.style.cssText = opts.buttonStyle || 'padding:10px 20px;background:#a78bfa;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;';
    btn.addEventListener('click', function () {
      openTryOnRoom({
        productId: opts.productId,
        variantId: opts.variantId,
        sessionId: opts.sessionId,
        openInNewTab: opts.openInNewTab !== false,
      });
    });
    el.appendChild(btn);
    return btn;
  }

  window.TryOnRoom = {
    init: function (opts) {
      opts = opts || {};
      if (opts.container) {
        createButton(opts.container, {
          apiKey: opts.apiKey,
          productId: opts.productId,
          variantId: opts.variantId,
          sessionId: opts.sessionId,
          buttonText: opts.buttonText,
          buttonClass: opts.buttonClass,
          buttonStyle: opts.buttonStyle,
          openInNewTab: opts.openInNewTab,
        });
      }
      return { open: openTryOnRoom };
    },
    open: openTryOnRoom,
  };
})();
