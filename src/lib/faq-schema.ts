import { z } from '@/lib/zod';
export const faqSchema = z.object({
  title: z.string().min(1, 'Insira o título'),
  category: z.enum(['Integration', 'Chat', 'Deals', 'Account', 'Other']),
  status: z.enum(['draft', 'published']),
  tags: z.array(z.string()).min(1, 'Escolha pelo menos uma etiqueta'),
  content: z.string().min(1, 'Insira o conteúdo'),
  id: z.string().optional().default(''),
});
