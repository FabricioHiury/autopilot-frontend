import { describe, expect, it } from 'vitest';
import { faqSchema } from '@/lib/faq-schema';
describe('FAQ contract', () => {
  const form = {title:'FAQ teste',category:'Account',status:'published',tags:['teste'],content:'Conteúdo de teste'};
  it('uses an empty identifier for a new FAQ and accepts UUIDs for editing', () => {
    expect(faqSchema.parse(form).id).toBe('');
    expect(faqSchema.parse({...form,id:'c53e83ca-c388-4310-b4c8-5e774067cc9c'}).id).toBe('c53e83ca-c388-4310-b4c8-5e774067cc9c');
  });
  it('rejects obsolete numeric IDs and Portuguese API enums', () => {
    expect(faqSchema.safeParse({...form,id:-1}).success).toBe(false);
    expect(faqSchema.safeParse({...form,status:'publicado'}).success).toBe(false);
    expect(faqSchema.safeParse({...form,category:'contas'}).success).toBe(false);
  });
});
