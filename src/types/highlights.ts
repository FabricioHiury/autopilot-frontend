export type Highlight = {
  storeId: string;
  name: string;
  newSalespeople: number;
  newDeals: {
    limit: number;
    percentage: number;
    success: {
      limit: number;
      percentage: number;
    };
  };
  salespersonHighlight: {
    id: string;
    photoUrl: string;
    name: string;
    limitSales: number;
    percentageSalesAboveAverage: number;
  };
  dealsAtOpen: {
    limit: number;
    percentage: number;
  };
  salesCompleted: {
    limit: number;
    percentage: number;
  };
  chatsWithoutReply: {
    percentage: number;
    limit: number;
  };
  tasksPending: {
    limit: number;
    percentage: number;
  };
};
