import { cn } from '@/lib/class-name.utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export interface AvatarUserProps {
  src?: string | undefined;
  name: string | undefined;
  size?: number;
  className?: string;
  tooltip?: boolean;
}

export default function AvatarUser({
  src,
  name,
  className,
  size = 2.75,
  tooltip = true,
}: AvatarUserProps) {
  if (!name) {
    name = 'Desconhecido';
  }

  if (!src) {
    src = '';
  }

  const sizeInRem = `${size}rem`;
  const classNames = cn(
    'flex-shrink-0 rounded-full overflow-hidden border border-white',
    className,
  );

  return tooltip ? (
    <AvatarUserWithTooltip src={src} name={name} sizeInRem={sizeInRem} classNames={classNames} />
  ) : (
    <AvatarUserWithoutTooltip src={src} name={name} sizeInRem={sizeInRem} classNames={classNames} />
  );
}

export function AvatarUserWithTooltip({
  src,
  name,
  sizeInRem,
  classNames,
}: {
  src: string;
  name: string;
  sizeInRem: string;
  classNames: string;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={classNames} style={{ width: sizeInRem, height: sizeInRem }}>
            <Avatar style={{ width: sizeInRem, height: sizeInRem }}>
              <AvatarImage src={src} />
              <AvatarFallback className="flex items-center justify-center w-full h-full">
                {name ? name[0].toUpperCase() : 'D'}
              </AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
        <TooltipContent>{name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AvatarUserWithoutTooltip({
  src,
  name,
  sizeInRem,
  classNames,
}: {
  src: string;
  name: string;
  sizeInRem: string;
  classNames: string;
}) {
  return (
    <div className={classNames} style={{ width: sizeInRem, height: sizeInRem }}>
      <Avatar style={{ width: sizeInRem, height: sizeInRem }}>
        <AvatarImage src={src} />
        <AvatarFallback className="flex items-center justify-center w-full h-full">
          {name ? name[0].toUpperCase() : 'D'}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
