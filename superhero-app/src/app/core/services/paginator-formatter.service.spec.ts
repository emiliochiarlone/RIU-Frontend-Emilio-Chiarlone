import { PaginatorFormatterService } from './paginator-formatter.service';
import { MatPaginator } from '@angular/material/paginator';

describe('PaginatorFormatterService', () => {
  it('should format labels y getRangeLabel', () => {
    const svc = new PaginatorFormatterService();
    const paginator = {
      _intl: {
        itemsPerPageLabel: '',
        nextPageLabel: '',
        firstPageLabel: '',
        lastPageLabel: '',
        previousPageLabel: '',
        getRangeLabel: (_p: number,_ps: number,_l: number) => ''
      }
    } as unknown as MatPaginator;

    svc.format(paginator);

    expect(paginator._intl.itemsPerPageLabel).toBe('Elementos por Página');
    const lbl = paginator._intl.getRangeLabel(0, 5, 21);
    expect(lbl).toContain('1 de');
    expect(lbl).toContain('21 elementos');
  });
});
