import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app, router }) {
    if (typeof window !== 'undefined') {
      // 페이지 로드 후 실행
      router.onAfterRouteChanged = () => {
        setTimeout(() => {
          addCollapsibleFeature()
          addHomePageFeatureClicks()
        }, 100)
      }
      
      // 초기 로드
      if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
              addCollapsibleFeature()
              addHomePageFeatureClicks()
            }, 100)
          })
        } else {
          setTimeout(() => {
            addCollapsibleFeature()
            addHomePageFeatureClicks()
          }, 100)
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

function addHomePageFeatureClicks() {
  // 홈페이지인지 확인
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    return
  }
  
  console.log('Adding homepage feature clicks...')
  
  // 기능 카드들 찾기
  const features = document.querySelectorAll('.VPFeatures .VPFeature')
  console.log('Found feature cards:', features.length)
  
  features.forEach((feature, index) => {
    const title = feature.querySelector('.title')?.textContent
    console.log(`Processing feature ${index + 1}:`, title)
    
    // 데이터 속성으로 링크 정보 설정
    const links = [
      '/version/main/introduction/about', // Autopilot
      '#', // GCS - Coming Soon
      'http://192.168.21.35:5000', // Log Review Python App
      '#'  // Simulation - Coming Soon
    ]
    
    const linkTexts = [
      'Get Started →',
      'Coming Soon',
      'Launch App →', // Log Review
      'Coming Soon'
    ]
    
    const link = links[index]
    const linkText = linkTexts[index]
    
    // Coming Soon 카드는 클릭 불가능하도록 설정
    if (link === '#') {
      feature.classList.add('coming-soon')
      feature.style.cursor = 'not-allowed'
    } else {
      feature.style.cursor = 'pointer'
      
      // 클릭 이벤트 추가
      feature.addEventListener('click', (e) => {
        e.preventDefault()
        console.log(`Feature clicked: ${title}, navigating to: ${link}`)
        
        // 외부 링크는 새 탭에서 열기
        if (link.startsWith('http')) {
          window.open(link, '_blank')
        } else {
          // 내부 링크는 같은 탭에서 이동
          window.location.href = link
        }
      })
    }
    
    // 링크 텍스트 추가
    const details = feature.querySelector('.details')
    if (details && !feature.querySelector('.link-text')) {
      const linkElement = document.createElement('div')
      linkElement.className = 'link-text'
      linkElement.textContent = linkText
      details.parentNode.appendChild(linkElement)
    }
  })
}