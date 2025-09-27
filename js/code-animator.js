import { getCSSVariable } from './config.js';

export class CodeAnimator {
  constructor() {
    this.currentCodeAnimation = null;
  }

  typeWriterWithClear(element, newText, speed = 1, onComplete = null) {
    if (this.currentCodeAnimation) {
      clearTimeout(this.currentCodeAnimation);
      this.currentCodeAnimation = null;
    }
    
    const colors = {
      success: getCSSVariable('--color-success'),
      error: getCSSVariable('--color-danger'),
    };

    const currentText = element.textContent;
    
    const deleteText = () => {
      element.style.setProperty('--cursor-color', colors.error);
      let i = currentText.length;
      
      const deleteChar = () => {
        if (i > 0) {
          element.textContent = currentText.substring(0, i - 1);
          i--;
          this.currentCodeAnimation = setTimeout(deleteChar, speed * 2);
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
          this.currentCodeAnimation = setTimeout(typeChar, speed);
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

  displayCodeImmediately(element, text) {
    if (this.currentCodeAnimation) {
      clearTimeout(this.currentCodeAnimation);
      this.currentCodeAnimation = null;
    }
    element.textContent = text;
  }
}
