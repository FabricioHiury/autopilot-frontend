"use client";

import CustomerListItem from "@/components/cards/CustomerListItem";
import { ClienteType } from "@/utils/types/dataTypes";

interface CustomersListProps {
    customers: ClienteType[];
    className?: string;
    canEditCustomers?: boolean;
}

const CustomersList: React.FC<CustomersListProps> = ({
    customers,
    className = "",
    canEditCustomers,
}) => {
    return (
        <div className={`${className} flex-1 flex flex-col gap-4 lg:gap-0`}>
            {customers.length > 0 ? (
                customers.map((customer, index) => (
                    <CustomerListItem
                        key={customer.id ?? `c-${index}`}
                        cliente={customer}
                        isFirstElement={index === 0}
                        canEditFromParent={canEditCustomers}
                    />
                ))
            ) : (
                <div
                    className="w-full text-center py-8 text-gray-500"
                    role="status"
                    aria-live="polite"
                >
                    Nenhum cliente encontrado com os filtros aplicados.
                </div>
            )}
        </div>
    );
};

export default CustomersList;
