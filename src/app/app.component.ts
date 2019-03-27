import { Component, OnInit, ViewChildren, HostListener,  } from '@angular/core';

import {
  moveItemInArray,
  transferArrayItem,
  CdkDropList,
  CdkDragDrop,
  CdkDragStart,
  CdkDragEnd,
  CdkDragEnter,
  CdkDragExit,
  CdkDragRelease,
  CdkDragMove,
  CdkDrag,
  DragRef
} from '@angular/cdk/drag-drop';
import { MatColumnDef, MatTable, MatCellDef } from '@angular/material';
import { CdkTable } from '@angular/cdk/table';
import { Element } from '@angular/compiler/src/render3/r3_ast';
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

  dragDropData: any = {};
  dragging: any = false;

  title = 'cdk-drag-drop';

  ngOnInit() {
    this.setDisplayedColumns();
  }

  setDisplayedColumns() {
    let i = 0;
    this.columns.forEach(item => {
      item.idx = i;
      this.displayedColumns[i] = item.field;
      i++;
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
      // cellEle.classList.add('cdk-drag-animating')
      cellEle.style.transform = newPos;
    });
  }

  getCellElement(cell) {
    return cell.nodes[0].renderElement;
  }

  dragStarted(event: CdkDragStart, index: number ) {
    this.dragging = event;
    this.dragRef = event.source;
    this.setDragColumnCells();
    this.applyDragAppearanceToCol();

    this.moveSubscription = this.dragRef.moved.subscribe( ( moveData  )  => {
      const dragPreviewEle = document.body.getElementsByClassName('cdk-drag-preview')[0];

      this.dragPreviewPos = dragPreviewEle.getBoundingClientRect();
      this.updateDragColPosition();
    });
    this.dragDropData = {};
    this.dragDropData.srcColumnIndex = index;
  }

  dropListDropped(event: any) { // CdkDropList
    if (event) {
      this.dragDropData.targetColumnIndex = this.getDnDColumIndex(event.container);
      this.resetDroppedColumn();
    }
    this.dragging = false;
    this.clearDragStyles();
    this.moveSubscription.unsubscribe();
  }

  private getDnDColumIndex(item) {
    if ( item && item.element && item.element.nativeElement ) {
      const cellIndex = item.element.nativeElement.cellIndex;
      return cellIndex;
    }
  }

  resetDroppedColumn() {
    console.log( this.dragDropData );
    const srcIndex = this.dragDropData.srcColumnIndex;
    const targetIndex = this.dragDropData.targetColumnIndex;
    if ( srcIndex !== targetIndex ) {
      this.columns.forEach(item => {
        const idx = item.idx;
        if ( srcIndex > targetIndex ) {
          if ( idx >= targetIndex && idx < srcIndex ) {
            item.idx = idx + 1;
          } else if ( idx ===  srcIndex ) {
            item.idx = targetIndex;
          }
        } else if ( srcIndex < targetIndex ) {
          if ( idx <= targetIndex && idx > srcIndex ) {
            item.idx = idx - 1;
          } else if ( idx ===  srcIndex ) {
            item.idx = targetIndex;
          }
        }
      });
      this.columns = this.columns.sort( ( obj1, obj2) => {
        return obj1.idx - obj2.idx;
      });
      this.setDisplayedColumns();
    }
  }
}
