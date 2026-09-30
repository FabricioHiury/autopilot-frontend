export type CallInfo = {
  isCall: boolean;
  isVideo?: boolean;
  missed?: boolean;
  ended?: boolean;
  accepted?: boolean;
  duration?: string;
};

export type LocationInfo = {
  isLocation: boolean;
  lat?: string;
  lng?: string;
  mapUrl?: string;
};

export type ContactInfo = {
  isContact: boolean;
  name?: string;
  phone?: string;
};

export type LinkInfo = { isLink: boolean; url: string };

export function isPixCopiaCola(text?: string | null): boolean {
  if (!text) return false;
  const t = text.trim();
  if (t.length < 30) return false;
  const starts000201 = t.startsWith('000201');
  const hasBcbDomain = /br\.gov\.bcb\.pix/i.test(t);
  const hasCrc = /6304[A-F0-9]{4}$/i.test(t);
  return (starts000201 && hasBcbDomain) || (hasBcbDomain && hasCrc) || (starts000201 && hasCrc);
}

export function parseCallMessage(content: string): CallInfo {
  const text = content?.toLowerCase() || '';
  const hasCall = /(chamada|ligação|ligacao|call|voice|vídeo|video)/i.test(text);
  if (!hasCall) return { isCall: false } as CallInfo;

  const isVideo = /(vídeo|video)/i.test(text);
  const missed = /(perdida|não atendida|nao atendida|missed)/i.test(text);
  const ended = /(encerrada|finalizada|ended|terminada)/i.test(text);
  const received = /(recebida|received)/i.test(text);
  const accepted = /(atendida|aceita|accepted|iniciada|started)/i.test(text);
  const duration = content.match(/(\d{1,2}:\d{2})/)?.[1] || undefined;

  const dateTimeMatch = content.match(/Data\/?Hora:\s*([^\n]+)/i);
  const dateTime = dateTimeMatch?.[1]?.trim();

  return { isCall: true, isVideo, missed, ended, received, accepted, duration, dateTime } as CallInfo;
}

export function parseLocationMessage(content: string): LocationInfo {
  const text = content || '';
  const isLocation = /localizaç|localizacao|latitude|longitude|maps\?q=/i.test(text);
  if (!isLocation) return { isLocation: false } as LocationInfo;
  const latMatch = text.match(/Latitude:\s*([\-\d\.]+)/i);
  const lngMatch = text.match(/Longitude:\s*([\-\d\.]+)/i);
  const urlMatch = text.match(/https?:\/\/www\.google\.com\/maps\?q=([^\s]+)/i);
  const lat = latMatch?.[1];
  const lng = lngMatch?.[1];
  const mapUrl = urlMatch?.[0] || (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : undefined);
  return { isLocation: true, lat, lng, mapUrl } as LocationInfo;
}

export function parseContactMessage(content: string): ContactInfo {
  const text = content || '';
  const isContact = /contato compartil|contato compartilhado|compartilhou um contato/i.test(text);
  if (!isContact) return { isContact: false } as ContactInfo;
  const match = text.match(/contato\s+compartilhado:\s*(.+?)\s*-\s*(\+?\d[\d\s]+)/i);
  const name = match?.[1]?.trim();
  const phone = match?.[2]?.replace(/\s+/g, '').trim();
  return { isContact: true, name, phone } as ContactInfo;
}

export function parseLinkMessage(content: string): LinkInfo {
  const text = content || '';

  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length > 1) {
    return { isLink: false, url: '' };
  }

  const singleLine = lines[0]?.trim() || '';

  const httpMatch = singleLine.match(/^(https?:\/\/[^\s<>"']+)$/i);
  if (httpMatch) {
    const cleaned = httpMatch[1].replace(/[),.;!?]+$/g, '');
    return { isLink: true, url: cleaned };
  }

  const domainMatch = singleLine.match(/^(?:www\.)?([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s<>"']*)?$/i);

  if (domainMatch) {
    const cleaned = domainMatch[0].replace(/[),.;!?]+$/g, '');
    return { isLink: true, url: cleaned };
  }

  return { isLink: false, url: '' };
}

export function analyzeMessage(content: string): {
  isPix: boolean;
  callInfo: CallInfo;
  locationInfo: LocationInfo;
  contactInfo: ContactInfo;
  linkInfo: LinkInfo;
} {
  const callInfo = parseCallMessage(content);
  const locationInfo = parseLocationMessage(content);
  const contactInfo = parseContactMessage(content);
  const linkInfo = parseLinkMessage(content);
  const isPix = isPixCopiaCola(content);
  return { isPix, callInfo, locationInfo, contactInfo, linkInfo };
}


