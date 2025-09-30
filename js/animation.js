function getCSSVariable(variableName) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

const colors = {
  success: getCSSVariable('--color-success'),
  warning: getCSSVariable('--color-warning'),
  error: getCSSVariable('--color-danger'),
  info: getCSSVariable('--color-primary')
};

const easings = {
  quad: getCSSVariable('--ease-out-quad'),
  back: getCSSVariable('--ease-out-back')
};

export function animateNewRow(row) {
  row.style.opacity = '0';
  row.style.transform = 'translateX(-50px) scale(0.9)';
  row.classList.add('table-row-enter');
  
  setTimeout(() => {
    row.style.transition = `all 0.5s ${easings.quad}`;
    row.style.opacity = '1';
    row.style.transform = 'translateX(0) scale(1)';
  }, 10);
}

export function animateDeleteRow(row) {
  row.style.transition = `all 0.4s ${easings.quad}`;
  row.style.opacity = '0';
  row.style.transform = 'translateX(-100px) scale(0.8)';
  
  setTimeout(() => {
    if (row.parentNode) {
      row.remove();
    }
  }, 400);
}

export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification`;
  notification.textContent = message;

  notification.style.backgroundColor = colors[type] || colors.info;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 3000);
}

export function typeWriterWithClear(element, newText, speed = 1, onComplete = null) {
  let currentCodeAnimation;

  const currentText = element.textContent;
  
  const deleteText = () => {
    element.style.setProperty('--cursor-color', colors.error);
    let i = currentText.length;
    
    const deleteChar = () => {
      if (i > 0) {
        element.textContent = currentText.substring(0, i - 1);
        i--;
        currentCodeAnimation = setTimeout(deleteChar, speed * 2);
      } else {
        typeText();
      }
    }
    
    deleteChar();
  }
  
  const typeText = () => {
    element.style.setProperty('--cursor-color', colors.success);
    let i = 0;
    
    const typeChar = () => {
      if (i < newText.length) {
        element.textContent = newText.substring(0, i + 1);
        i++;
        currentCodeAnimation = setTimeout(typeChar, speed);
      } else {
        element.classList.remove('typing');
        if (onComplete) onComplete();
      }
    }
    
    typeChar();
  }
  
  element.classList.add('typing');
  
  if (currentText.length > 0) {
    deleteText();
  } else {
    typeText();
  }
}

export function displayCodeImmediately(element, text) {
  element.textContent = text;
  element.style.animation = `fadeInUp 0.6s ${easings.quad}`;
  setTimeout(() => {
    element.style.animation = '';
  }, 600);
}

export function createParallaxBackground() {
  const parallaxBg = document.createElement('div');
  parallaxBg.className = 'parallax-bg';
  
  for (let i = 0; i < 3; i++) {
    const element = document.createElement('div');
    element.className = 'parallax-element';
    parallaxBg.appendChild(element);
  }
  
  document.body.appendChild(parallaxBg);
}

export function animateButton(button) {
  button.classList.add('btn-pulse');
  setTimeout(() => {
    button.classList.remove('btn-pulse');
  }, 500);
}

export function shakeElement(element) {
  element.style.animation = `shake 0.5s ${easings.quad}`;
  setTimeout(() => {
    element.style.animation = '';
  }, 500);
}

if (!document.querySelector('#animation-styles')) {
  const style = document.createElement('style');
  style.id = 'animation-styles';
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}