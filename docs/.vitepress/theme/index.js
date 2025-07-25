import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app, router }) {
    if (typeof window !== 'undefined') {
      // 페이지 로드 후 실행
      router.onAfterRouteChanged = () => {
        setTimeout(addCollapsibleFeature, 100)
      }
      
      // 초기 로드
      if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            setTimeout(addCollapsibleFeature, 100)
          })
        } else {
          setTimeout(addCollapsibleFeature, 100)
        }
      }
    }
  }
}

function addCollapsibleFeature() {
  console.log('Adding collapsible feature...')
  
  // 이미 처리된 경우 건너뛰기
  if (document.querySelector('.collapsible-heading')) {
    console.log('Already processed, skipping...')
    return
  }

  // h2 접기 기능 추가
  const headings = document.querySelectorAll('.vp-doc h2')
  console.log('Found headings:', headings.length)
  
  headings.forEach((heading, index) => {
    console.log(`Processing heading ${index + 1}:`, heading.textContent)
    
    heading.classList.add('collapsible-heading')
    heading.style.cursor = 'pointer'
    
    // 클릭 이벤트 추가
    heading.addEventListener('click', function(e) {
      e.preventDefault()
      e.stopPropagation()
      console.log('Heading clicked:', this.textContent)
      toggleSection(this)
    })
  })
  
  // h4 아래 내용들 들여쓰기
  addIndentationToH4Sections()
}

function addIndentationToH4Sections() {
  const h4Headings = document.querySelectorAll('.vp-doc h4')
  console.log('Adding indentation to h4 sections, found:', h4Headings.length)
  
  h4Headings.forEach(h4 => {
    let currentElement = h4.nextElementSibling
    
    while (currentElement) {
      const tagName = currentElement.tagName
      
      // h2, h3, h4, hr을 만나면 중단
      if (tagName && (tagName.match(/^H[1-4]$/) || tagName === 'HR')) {
        break
      }
      
      // 들여쓰기 적용
      currentElement.style.marginLeft = '20px'
      currentElement = currentElement.nextElementSibling
    }
  })
}

function getSectionContent(heading) {
  const content = []
  let currentElement = heading.nextElementSibling
  const headingLevel = parseInt(heading.tagName.charAt(1))
  
  while (currentElement) {
    const tagName = currentElement.tagName
    
    // 헤딩을 만나면 레벨 확인
    if (tagName && tagName.match(/^H[1-6]$/)) {
      const currentLevel = parseInt(tagName.charAt(1))
      // 같은 레벨이나 상위 레벨 헤딩이면 중단
      if (currentLevel <= headingLevel) {
        break
      }
    }
    
    const nextElement = currentElement.nextElementSibling
    content.push(currentElement)
    currentElement = nextElement
  }
  
  return content
}

function toggleSection(heading) {
  console.log('Toggle section called for:', heading.textContent)
  
  const headingLevel = parseInt(heading.tagName.charAt(1))
  const isCollapsed = heading.classList.contains('collapsed')
  
  console.log('Current state collapsed:', isCollapsed)
  
  // 다음 요소들을 찾아서 직접 숨기기/보이기
  let currentElement = heading.nextElementSibling
  const elementsToToggle = []
  
  while (currentElement) {
    const tagName = currentElement.tagName
    
    // 헤딩을 만나면 레벨 확인
    if (tagName && tagName.match(/^H[1-6]$/)) {
      const currentLevel = parseInt(tagName.charAt(1))
      // 같은 레벨이나 상위 레벨 헤딩이면 중단
      if (currentLevel <= headingLevel) {
        break
      }
    }
    
    elementsToToggle.push(currentElement)
    currentElement = currentElement.nextElementSibling
  }
  
  console.log('Found elements to toggle:', elementsToToggle.length)
  
  if (isCollapsed) {
    // 펼치기
    heading.classList.remove('collapsed')
    elementsToToggle.forEach(element => {
      element.style.display = ''
    })
    console.log('Section expanded')
  } else {
    // 접기
    heading.classList.add('collapsed')
    elementsToToggle.forEach(element => {
      element.style.display = 'none'
    })
    console.log('Section collapsed')
  }
}