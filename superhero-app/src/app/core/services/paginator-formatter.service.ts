import { MatPaginator } from "@angular/material/paginator";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginatorFormatterService {

  constructor(
  ) { }

  public format(paginator: MatPaginator) : void {
    if(paginator) {

      paginator._intl.itemsPerPageLabel='Elementos por Página';
      paginator._intl.nextPageLabel='Siguiente Página'
      paginator._intl.firstPageLabel="Primera Página";
      paginator._intl.lastPageLabel="Última Página"
      paginator._intl.previousPageLabel= "Página Anterior"
      paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        const of = "de"

        const remainder = length % pageSize;
        let pageCount = (length-remainder)/pageSize;

        if(remainder == 0 && pageCount != 0) {
          pageCount--;
        }

        return `${page} ${of} ${pageCount}`;
      };
    }
  }

}
