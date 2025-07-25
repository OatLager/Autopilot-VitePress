import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid"

// https://vitepress.vuejs.org/config/app-configs
export default withMermaid(
  defineConfig({
    title: 'Document Viewer',
    description: 'A simple document viewer',
    titleTemplate: false,
    head: [
      ['link', { rel: 'icon', href: '/logo.png' }]
    ],
    themeConfig: {
      logo: '/logo.png', // public 폴더에 로고 파일 추가
      siteTitle: 'Document Viewer', // 로고와 타이틀 함께 표시
      logoLink: '/version/main/introduction/about',
      search: {
        provider: 'local',
        options: {
          locales: {
            root: {
              translations: {
                button: {
                  buttonText: '검색',
                  buttonAriaLabel: '검색'
                },
                modal: {
                  noResultsText: '검색 결과가 없습니다',
                  resetButtonTitle: '검색 조건 초기화',
                  footer: {
                    selectText: '선택',
                    navigateText: '이동',
                    closeText: '닫기'
                  }
                }
              }
            }
          }
        }
      },
      nav: [
        { 
          text: 'Version', 
          items: [
            { text: 'Main', link: '/version/main/introduction/about' }
          ]
        }
      ],
      sidebar: {
        '/version/main/': [
          {
            text: 'Introduction',
            collapsible: true,
            collapsed: false,
            items: [
              { text: 'About', link: '/version/main/introduction/about' }
            ]
          },
          {
            text: 'Concepts',
            collapsible: true,
            collapsed: false,
            items: [
              {
                text: 'System',
                collapsible: true,
                collapsed: false,
                items: [
                  { text: '01 - Build Sequence', link: '/version/main/concepts/system/build_sequence' },
                  { text: '02 - Startup Sequence', link: '/version/main/concepts/system/startup_sequence' }
                ]
              },
              {
                text: 'Modules',
                collapsible: true,
                collapsed: false,
                items: [
                  { text: '01 - Thread', link: '/version/main/concepts/modules/module_system' },
                  { text: '02 - Module', link: '/version/main/concepts/modules/work_queue' }
                ]
              }
            ]
          },
          {
            text: 'Documentation',
            collapsible: true,
            collapsed: true,
            items: [
              { text: 'Style Guide', link: '/version/main/documentation/style_guide' }
            ]
          }
        ]
      }
    },
    // 마크다운 설정
    markdown: {
      lineNumbers: true // 코드 블록에 라인 넘버 표시
    },
    // Mermaid 설정
    mermaid: {
      theme: 'default'
    }
  })
)
