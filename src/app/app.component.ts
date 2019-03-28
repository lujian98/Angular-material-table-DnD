import { CdkDrag, CdkDragStart, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChildren } from '@angular/core';
import { MatColumnDef } from '@angular/material';
import { Subscription } from 'rxjs';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChildren(MatColumnDef) viewCols: any;

  moveSubscription: Subscription;
  dragRef: CdkDrag;
  dragPreviewEle: any;
  dragPreviewPos: any;
  dragColCells: any;
  cellData: any;
  origCellStyles: object[] = [];

  columns: any[] = [
    { field: 'position' },
    { field: 'name' },
    { field: 'weight' },
    { field: 'symbol' }
  ];

  displayedColumns: string[] = [];
  dataSource = ELEMENT_DATA;

  previousIndex: number;
  dragging: any = false;

  title = 'Material Table column drag and drop';

  ngOnInit() {
    this.setDisplayedColumns();
  }

  setDisplayedColumns() {
    this.columns.forEach(( item, index) => {
      item.index = index;
      this.displayedColumns[index] = item.field;
    });
  }

  setDragColumnCells() {
    const dragColRef = this.viewCols.find(col => col.name === this.dragRef.data.name);
    this.dragColCells = dragColRef.cell.template._projectedViews;

    this.cellData = this.getCellElement(this.dragColCells[0]).getBoundingClientRect();
  }

  applyDragAppearanceToCol() {
    this.dragColCells.forEach(cell => {
      Object.assign(this.getCellElement(cell).style, this.generatedCellDragStyles());
    });
  }

  clearDragStyles() {
    this.dragColCells.forEach((cell, i) => {
      this.getCellElement(cell).removeAttribute('style');
    });
  }

  generatedCellDragStyles() {
    return {
      position: 'fixed',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      left: '0px',
      width: `${this.cellData.width}px`,
      height: `${this.cellData.height}px`,
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden'
    };
  }

  updateDragColPosition() {
    this.dragColCells.forEach(cell => {
      const posX = this.dragPreviewPos.left;
      const newPos = `translate3d(${posX}px, 0, 0)`;
      const cellEle: HTMLElement = this.getCellElement(cell);
      cellEle.style.transform = newPos;
    });
  }

  getCellElement(cell) {
    return cell.nodes[0].renderElement;
  }

  dragStarted(event: CdkDragStart, index: number ) {
    this.previousIndex = index;
    this.dragging = event;
    this.dragRef = event.source;
    this.setDragColumnCells();
    this.applyDragAppearanceToCol();

    this.moveSubscription = this.dragRef.moved.subscribe( ( moveData  )  => {
      const dragPreviewEle = document.body.getElementsByClassName('cdk-drag-preview')[0];

      this.dragPreviewPos = dragPreviewEle.getBoundingClientRect();
      this.updateDragColPosition();
    });
  }

  dropListDropped(event: CdkDropList, index: number) {
    if (event) {
      moveItemInArray(this.columns, this.previousIndex, index);
      this.setDisplayedColumns();
    }
    this.dragging = false;
    this.clearDragStyles();
    this.moveSubscription.unsubscribe();
  }
}
