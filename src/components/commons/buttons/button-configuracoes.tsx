import ButtonCircle from './button-circle/button-circle';
import ButtonConfigIcon from './button-circle/icons/button-config-icon';

export default function ButtonConfiguracoes({ onClick }: { onClick: Function }) {
  return <ButtonCircle onClick={() => onClick()} icon={<ButtonConfigIcon />} />;
}
