import {
  FEEDBACK_EMAIL,
  ISSUES_URL,
  REVIEW_URL,
  describeEnvironment,
  feedbackMailto,
} from '../../src/shared/feedback';

describe('feedbackMailto', () => {
  const env = { browser: 'Chrome 142', os: 'macOS' };
  const link = feedbackMailto({ version: '0.1.1', env });
  const params = new URLSearchParams(link.slice(link.indexOf('?') + 1));

  it('addresses the feedback mailbox', () => {
    expect(link.startsWith(`mailto:${FEEDBACK_EMAIL}?`)).toBe(true);
    expect(FEEDBACK_EMAIL).toBe('draob@engelrico.de');
  });

  it('puts the version into the subject and version, browser and system into the text', () => {
    expect(params.get('subject')).toBe('draob Feedback (v0.1.1)');
    const body = params.get('body');
    expect(body).toContain('Version: 0.1.1');
    expect(body).toContain('Browser: Chrome 142');
    expect(body).toContain('System: macOS');
  });

  it('asks not to send passwords, board links or confidential screenshots', () => {
    expect(params.get('body')).toMatch(/Bitte keine Passwörter, Board-Links/);
  });

  it('is fully encoded and short enough for mail programs', () => {
    expect(link).not.toMatch(/[\s\n\r]/);
    expect(link.length).toBeLessThan(1800);
    expect(params.get('body')).toContain('\r\n'); // line breaks survive as CRLF
  });

  it('copes with a missing version or environment', () => {
    const bare = new URLSearchParams(feedbackMailto({}).split('?')[1]);
    expect(bare.get('subject')).toBe('draob Feedback (vunbekannt)');
    expect(bare.get('body')).toContain('Browser: unbekannt');
  });
});

describe('describeEnvironment', () => {
  it('reads Chrome and the platform from userAgentData', () => {
    const nav = {
      userAgent: '',
      userAgentData: {
        platform: 'macOS',
        brands: [
          { brand: 'Not A;Brand', version: '99' },
          { brand: 'Chromium', version: '142' },
          { brand: 'Google Chrome', version: '142' },
        ],
      },
    };
    expect(describeEnvironment(nav)).toEqual({ browser: 'Chrome 142', os: 'macOS' });
  });

  it('prefers Edge over plain Chromium and falls back to Chromium', () => {
    const brands = (...b) => ({ userAgent: '', userAgentData: { platform: 'Windows', brands: b } });
    expect(
      describeEnvironment(
        brands({ brand: 'Chromium', version: '141' }, { brand: 'Microsoft Edge', version: '141' }),
      ).browser,
    ).toBe('Microsoft Edge 141');
    expect(describeEnvironment(brands({ brand: 'Chromium', version: '141' })).browser).toBe(
      'Chromium 141',
    );
  });

  it('falls back to the user agent text', () => {
    const ua = (userAgent) => ({ userAgent });
    expect(
      describeEnvironment(
        ua(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141.0.0.0 Safari/537.36',
        ),
      ),
    ).toEqual({ browser: 'Chrome 141', os: 'Windows' });
    expect(
      describeEnvironment(
        ua('Mozilla/5.0 (X11; Linux x86_64) Chrome/140.0 Safari/537.36 Edg/140.0'),
      ).browser,
    ).toBe('Edge 140');
    expect(
      describeEnvironment(ua('Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) Chrome/140.0')).os,
    ).toBe('ChromeOS');
  });

  it('recognizes Firefox, which has no userAgentData', () => {
    const nav = {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0',
    };
    expect(describeEnvironment(nav)).toEqual({ browser: 'Firefox 140', os: 'macOS' });
  });

  it('reports unknown instead of throwing', () => {
    expect(describeEnvironment(null)).toEqual({ browser: 'unbekannt', os: 'unbekannt' });
    expect(describeEnvironment({})).toEqual({ browser: 'unbekannt', os: 'unbekannt' });
  });
});

describe('feedback urls', () => {
  it('are empty (hidden) or plain https', () => {
    for (const url of [ISSUES_URL, REVIEW_URL]) {
      expect(url === '' || /^https:\/\/[^\s]+$/.test(url)).toBe(true);
    }
    expect(ISSUES_URL).not.toBe('');
  });
});
