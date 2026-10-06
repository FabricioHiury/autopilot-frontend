import { describe, expect, it } from 'vitest';
import { dealSchema } from '@/lib/deal-schema';
const form = {title:'Teste',vincularCliente:false,note:'',dealOrigin:'other',temperature:'COLD',dealMode:'SELL',idAssignees:['employee'],nomeCompleto:'Cliente teste',email:'teste@autopilot.local',phone:'11999990000'};
describe('create deal API contract', () => {
  it('sends nameComplete for an unregistered customer', () => {
    const payload = dealSchema.parse(form);
    expect(payload).toMatchObject({nameComplete:'Cliente teste'});
    expect(payload).not.toHaveProperty('nomeCompleto');
    expect(payload).not.toHaveProperty('vincularCliente');
    expect(payload).not.toHaveProperty('customerId');
  });
  it('sends only the customer identifier when linking an existing customer', () => {
    const payload = dealSchema.parse({...form,vincularCliente:true,customerId:'customer'});
    expect(payload).toHaveProperty('customerId', 'customer');
    expect(payload).not.toHaveProperty('nameComplete');
    expect(payload).not.toHaveProperty('nomeCompleto');
    expect(payload).not.toHaveProperty('email');
  });
});
