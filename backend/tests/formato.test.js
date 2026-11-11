import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatearPesos, aEntero, escaparHtml } from '../src/utils/formato.js';

describe('formato', () => {
    it('formatea montos en pesos chilenos', () => {
        assert.equal(formatearPesos(15000), '$15.000');
        assert.equal(formatearPesos('1500000'), '$1.500.000');
        assert.equal(formatearPesos(null), '$0');
    });

    it('convierte textos con formato de pesos a enteros', () => {
        assert.equal(aEntero('$10.000'), 10000);
        assert.equal(aEntero(' 2500 '), 2500);
        assert.equal(aEntero(''), null);
        assert.equal(aEntero('abc'), null);
        assert.equal(aEntero(undefined), null);
    });

    it('escapa HTML', () => {
        assert.equal(
            escaparHtml('<a href="x">\'&\'</a>'),
            '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
        );
    });
});
