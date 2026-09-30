import AvatarMore from "@/components/commons/avatar-mais";
import AvatarUser from "@/components/commons/avatar-user";
import { profileImageUrl } from "@/lib/profile.utils";
import { UserType } from "@/utils/types/dataTypes";

interface AvatarListProps {
    users: UserType[];
    total?: number;
    size?: number;
}

const AvatarList: React.FC<AvatarListProps> = ({
    users,
    total = 1,
    size = 4,
}) => {
    return (
        <ul className="flex flex-row gap-0 items-center -space-x-3">
            {users.slice(0, size).map((user, index) => (
                <li key={index}>
                    <AvatarUser
                        name={user.nome}
                        src={user.id ? profileImageUrl(user.id) : ""}
                    />
                </li>
            ))}

            {users.length >= size && (
                <li>
                    <AvatarMore qtd={total - size} entidade="clientes" />
                </li>
            )}
        </ul>
    );
};

export default AvatarList;