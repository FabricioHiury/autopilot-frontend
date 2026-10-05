import { BtnStrong, BtnTransparent } from '../commons/buttons/buttons';
import CenterModal from '../commons/modais/center-modal';

export function ModalFaq({
  icon,
  title,
  text,
  textBtn,
  onClick,
  visible,
  onClose,
}: {
  icon: any;
  title: string;
  text: string;
  textBtn: string;
  onClick: VoidFunction;
  visible: boolean;
  onClose: VoidFunction;
}) {
  return (
    <>
      {visible && (
        <CenterModal idSelector="content-container" onClose={onClose}>
          <div className="flex flex-col w-[415px] items-center justify-center p-5 px-10">
            <div className="flex flex-col items-center px-4 gap-5">
              <div className="flex justify-center items-center w-[53px] h-[53px] rounded-full bg-[#EBEEF2]">
                {icon}
              </div>

              <h2 className="text-[28px] leading-8 mb-2 text-[#24292E] font-semibold text-center">
                {title}
              </h2>
            </div>
            <p className="text-[16px] text-[#657380] text-center">{text}</p>
            <div className="flex flex-col gap-2 w-full mt-5">
              {textBtn.length > 0 && <BtnTransparent label={textBtn} onClick={onClick} />}
              <BtnStrong label="Continuar" onClick={onClose} />
            </div>
          </div>
        </CenterModal>
      )}
    </>
  );
}
