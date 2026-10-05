'use client';
export interface InputRadioOptionProps {
  selected: boolean;
  color?: string;
  onChange?: (selected: boolean) => void;
  id?: string;
}

export default function InputRadioOption({
  selected,
  onChange,
  color = 'hsl(var(--primary))',
  id,
}: InputRadioOptionProps) {
  const handleClick = () => {
    if (onChange) {
      onChange(!selected);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  };

  const backgroundColor = selected ? color : 'transparent';

  return (
    <div>
      <div
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-active={selected}
        className="cursor-pointer w-4 h-4 rounded-full flex items-center justify-center data-[active=false]:border data-[active=false]:border-[#cbd4e0] data-[active=false]:block"
        style={{ backgroundColor: backgroundColor }}
      >
        {selected && (
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.23225 0.949152C9.17028 0.886666 9.09654 0.83707 9.0153 0.803224C8.93406 0.769378 8.84693 0.751953 8.75892 0.751953C8.67091 0.751953 8.58377 0.769378 8.50253 0.803224C8.4213 0.83707 8.34756 0.886666 8.28559 0.949152L3.31892 5.92249L1.23225 3.82915C1.1679 3.76699 1.09194 3.71812 1.00871 3.68531C0.92547 3.65251 0.836587 3.63642 0.747133 3.63797C0.657679 3.63952 0.569407 3.65867 0.487354 3.69433C0.405302 3.73 0.331077 3.78147 0.268918 3.84582C0.206759 3.91017 0.157883 3.98613 0.125081 4.06936C0.092278 4.1526 0.076191 4.24148 0.0777387 4.33094C0.0792863 4.42039 0.0984382 4.50866 0.134101 4.59072C0.169763 4.67277 0.221237 4.74699 0.285585 4.80915L2.84559 7.36915C2.90756 7.43164 2.98129 7.48123 3.06253 7.51508C3.14377 7.54893 3.23091 7.56635 3.31892 7.56635C3.40693 7.56635 3.49406 7.54893 3.5753 7.51508C3.65654 7.48123 3.73028 7.43164 3.79225 7.36915L9.23225 1.92915C9.29992 1.86672 9.35393 1.79096 9.39087 1.70662C9.4278 1.62229 9.44687 1.53122 9.44687 1.43915C9.44687 1.34708 9.4278 1.25601 9.39087 1.17168C9.35393 1.08735 9.29992 1.01158 9.23225 0.949152Z"
              fill="white"
            />
          </svg>
        )}
      </div>
      <input type="checkbox" id={id} checked={selected} onChange={handleClick} className="hidden" />
    </div>
  );
}
