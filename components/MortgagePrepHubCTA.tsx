import HubBacklink from './HubBacklink'

/**
 * 주담대 준비 허브 백링크.
 *
 * 마크업은 HubBacklink 하나로 통일했고, 이 컴포넌트는 기존 호출부(계산기 5곳·
 * 가이드 3곳)를 그대로 두기 위한 이름이다. 호출부를 정리할 때 함께 없애도 된다.
 */
export default function MortgagePrepHubCTA() {
  return <HubBacklink hub="mortgage-preparation" />
}
