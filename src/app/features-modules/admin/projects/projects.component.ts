import { Component, OnInit } from '@angular/core';

// import { Subject } from "rxjs";
import { ShareDataService } from 'src/app/core/data/share-data.service';
import { MatTableDataSource } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { apiResultFormat, Company } from 'src/app/core/models/models';
import { CompanyService } from 'src/app/core/services/company.service';
import { routes } from 'src/app/core/helpers/routes/routes';
import { CommonService } from 'src/app/core/services/common/common.service';
declare var bootstrap: any;
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  public routes = routes;
  public lstProject!: Array<Company>;
  public url = 'admin';
  public searchDataValue = '';
  dataSource!: MatTableDataSource<Company>;
  public lastIndex = 0;
  public pageSize = 10;
  public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<pageSelection> = [];
  public totalPages = 0;
  filter: boolean = false;
  companiesData: any[] = [];
  selectedCompany: any = null;
  filteredCompanies: any[] = [];
  selectedStatus: string | null = null;
  countClient: number = 0;

  companyToDelete: any;
  selectedHederTitle = 'Tous les';

  //** / pagination variables
  constructor(
    private data: ShareDataService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.getTableData();
  }

  //Filter toggle
  openFilter() {
    this.filter = !this.filter;
  }

  filterCompaniesByStatus(status: string | null): void {
    this.selectedHederTitle = this.getTranslation(status);
    this.selectedStatus = status;
    if (!status) {
      // If no status is provided, return all companies
      this.filteredCompanies = this.companiesData;
    } else {
      // Filter companies based on the status name
      this.filteredCompanies = this.companiesData.filter(
        (company: any) => company.status?.name === status
      );
    }
    this.countClient = this.filteredCompanies.length;
  }

  setSelectedCompany(company: any): void {
    this.selectedCompany = company;
  }

  private getTableData(): void {
    this.companyService.getAllCompanies().subscribe(
      (response) => {
        this.companiesData = response;
        this.filteredCompanies = response;
        this.countClient = response.length;
      },
      (error) => {
        console.error('Error fetching companies:', error);
      }
    );
  }

  getDate(isoDate: string): string {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('en-GB').format(date); // Formats as DD/MM/YYYY
  }

  public sortData(sort: Sort) {
    const data = this.lstProject.slice();

    if (!sort.active || sort.direction === '') {
      this.lstProject = data;
    } else {
      this.lstProject = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];

        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  public searchData(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.lstProject = this.dataSource.filteredData;
  }

  public getMoreData(event: string): void {
    if (event == 'next') {
      this.currentPage++;
      this.pageIndex = this.currentPage - 1;
      this.limit += this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableData();
    } else if (event == 'previous') {
      this.currentPage--;
      this.pageIndex = this.currentPage - 1;
      this.limit -= this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableData();
    }
  }

  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.skip = this.pageSelection[pageNumber - 1].skip;
    this.limit = this.pageSelection[pageNumber - 1].limit;
    if (pageNumber > this.currentPage) {
      this.pageIndex = pageNumber - 1;
    } else if (pageNumber < this.currentPage) {
      this.pageIndex = pageNumber + 1;
    }
    this.getTableData();
  }

  public changePageSize(): void {
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.getTableData();
  }

  private calculateTotalPages(totalData: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalPages = totalData / pageSize;
    if (this.totalPages % 1 != 0) {
      this.totalPages = Math.trunc(this.totalPages + 1);
    }
    for (let i = 1; i <= this.totalPages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;
      this.pageNumberArray.push(i);
      this.pageSelection.push({ skip: skip, limit: limit });
    }
  }

  getTranslation(key: string | null): string {
    if (key === null) {
      return 'Tous les';
    } else {
      const translations: { [key: string]: string } = {
        Active: 'Actifs',
        Inactive: 'Inactifs',
      };
      return translations[key] || key;
    }
  }

  deleteCompany(company: any) {
    console.log(company);
    this.companyService.deleteCompany(company?.id).subscribe({
      next: (res) => {
        this.hideDeleteCategoryModal();
        this.getTableData();
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  showDeleteCategoryModal(company: any) {
    this.companyToDelete = company;
    const modalElement = document.getElementById('delete_client');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      modalElement.focus();
    }
  }

  hideDeleteCategoryModal() {
    const modalElement = document.getElementById('delete_client');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
}
export interface pageSelection {
  skip: number;
  limit: number;
}
