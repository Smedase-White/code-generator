function getCSSVariable(variableName) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

const colors = {
  success: getCSSVariable('--color-success'),
  warning: getCSSVariable('--color-warning'),
  error: getCSSVariable('--color-danger'),
  info: getCSSVariable('--color-primary')
};

export function animateNewRow(row) {
  row.style.opacity = '0';
  row.style.transform = 'translateX(-100%)';
  
  setTimeout(() => {
    row.style.transition = 'all 0.3s ease-out';
    row.style.opacity = '1';
    row.style.transform = 'translateX(0)';
  }, 10);
}

export function animateDeleteRow(row) {
  row.style.transition = 'all 0.3s ease-out';
  row.style.opacity = '0';
  row.style.transform = 'translateX(-100%)';
  
  setTimeout(() => {
    row.remove();
  }, 300);
}

export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification`;
  notification.textContent = message;
  
  notification.style.backgroundColor = colors[type] || colors.info;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
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
}