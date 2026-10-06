import AvatarMore from '@/components/commons/avatar-mais';
import AvatarUser from '@/components/commons/avatar-user';
import { UserType } from '@/types/customer';

interface AvatarListProps {
  users: UserType[];
  total?: number;
  size?: number;
}

const AvatarList: React.FC<AvatarListProps> = ({ users, total = 1, size = 4 }) => {
  return (
    <ul className="flex flex-row gap-0 items-center -space-x-3">
      {users.slice(0, size).map((user, index) => (
        <li key={index}>
          <AvatarUser name={user.name} src={user.icon ?? ''} />
        </li>
      ))}

      {users.length >= size && (
        <li>
          <AvatarMore qtd={total - size} entity="customers" />
        </li>
      )}
    </ul>
  );
};

export default AvatarList;
