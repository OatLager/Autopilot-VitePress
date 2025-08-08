import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid"

// https://vitepress.vuejs.org/config/app-configs
export default withMermaid(
  defineConfig({
    title: 'Autopilot CORE',
    description: 'A simple document viewer',
    titleTemplate: false,
    head: [
      ['link', { rel: 'icon', href: '/logo.png' }]
    ],
    themeConfig: {
      logo: '/logo.png', // public 폴더에 로고 파일 추가
      siteTitle: 'Autopilot CORE', // 로고와 타이틀 함께 표시
      logoLink: 'index.md',
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
            text: 'Introduction', collapsible: true, collapsed: false,
            items: [
              { text: '- About', link: '/version/main/introduction/about' }
            ]
          },
          {
            text: 'Concepts', collapsible: true, collapsed: false,
            items: [
              {
                text: '- System', collapsible: true, collapsed: false,
                items: [
                  { text: 'Build Sequence', link: '/version/main/concepts/system/build_sequence' },
                  { text: 'Startup Sequence', link: '/version/main/concepts/system/startup_sequence' }
                ]
              },
              {
                text: '- Modules', collapsible: true, collapsed: false,
                items: [
                  { text: 'Thread', link: '/version/main/concepts/modules/thread' },
                  { text: 'WorkQueue Module', collapsible : true, collapsed: false, link: '/version/main/concepts/modules/workqueue/main',
                    items: [
                      { text: 'about WorkQueue', link: '/version/main/concepts/modules/workqueue/about_workqueue'},
                      { text: 'custom Module', link: '/version/main/concepts/modules/workqueue/custom_module'}  
                     ]
                  },
                  { text: 'Standalone Module', link: '/version/main/concepts/modules/module_taskspawn' }
                ]
              }
            ]
          },
          {
            text: 'MAVLink', collapsible: true, collapsed: true,
            items: [
              { text: '- MSG List', link: '/version/main/mavlink/ing' },
              { text: 'Overview', link: '/version/main/mavlink/overview' },
              { text: 'Concept', link: '/version/main/mavlink/concept' },
              { text: 'Implementation', link: '/version/main/mavlink/implementation' }
            ]
          },
          {
            text: 'Commander', collapsible: true, collapsed: true,
            items: [
              { text: '- FailSafe', collapsible: true, collapsed: true,
                items: [
                  { text: 'Overview', link: '/version/main/commander/failsafe/overview' },
                  { text: 'Concept', link: '/version/main/commander/failsafe/concept' },
                  { text: 'Implementation', link: '/version/main/commander/failsafe/implementation' },
                  { text: 'Verification', collapsible: true, collapsed: true,
                    items: [
                      { text: 'Static Analysis', link: '/version/main/commander/failsafe/verification/static_analysis' },
                      { text: 'Dynamic Analysis', link: '/version/main/commander/failsafe/verification/dynamic_analysis' }                    ]
                  }
                ]
              },
              { text: '- FailureDetector', collapsible: true, collapsed: true,
                items: [
                  { text: 'Overview', link: '/version/main/commander/failure_detector/overview' },
                  { text: 'Concept', link: '/version/main/commander/failure_detector/concept' },
                  { text: 'Implementation', link: '/version/main/commander/failure_detector/implementation' },
                  { text: 'Verification', collapsible: true, collapsed: true,
                    items: [
                      { text: 'Static Analysis', link: '/version/main/commander/failure_detector/verification/static_analysis' },
                      { text: 'Dynamic Analysis', link: '/version/main/commander/failure_detector/verification/dynamic_analysis' }                    ]
                  }
                ]
              },
              { text: '- ModeManagement', collapsible: true, collapsed: true,
                items: [
                  { text: 'ModeManagement', link: '/version/main/commander/mode_management/ing' }
                ]
              },
            ]
          },
          {
            text: 'Simulation', collapsible: true, collapsed: true,
            items: [
              { text: '- Simulation-In-Hardware', collapsible: true, collapsed: true, link: '/version/main/simulation/simulation-in-hardware/main',
                items: [
                  { text: 'SIH Start', link: '/version/main/simulation/simulation-in-hardware/sih_start'}
                ]
               }
            ]
          },
          {
            text: 'Documentation', collapsible: true, collapsed: true,
            items: [
              { text: '- Style Guide', link: '/version/main/documentation/style_guide' }
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
