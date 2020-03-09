import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as go from 'gojs';
import { DataSyncService } from 'gojs-angular';



@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PaletteComponent implements OnInit {

  constructor() { }

    //Palette
    public initPalette(): go.Palette {
      const $ = go.GraphObject.make;
      const palette = $(go.Palette);
  
      // define the Node template
      palette.nodeTemplate =
        $(go.Node, 'Auto',
          $(go.Shape, 'RoundedRectangle',
            {
              stroke: null,
              fill:"yellow"
            },
          ),
          $(go.TextBlock, { margin: 5, editable: true, isMultiline:false,name: "TEXT"},
            new go.Binding('text', 'key').makeTwoWay())
        );
  
      palette.model = $(go.GraphLinksModel,
        {
          linkKeyProperty: 'key'  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        });
      return palette;
    }
    public paletteNodeData: go.ObjectData[] = [
      { key: "Node"}
    ];
    public paletteLinkData: go.ObjectData[] = [
      
    ];
    public paletteModelData = { prop: 'val' };
    public paletteDivClassName = 'myPaletteDiv';
    public paletteModelChange = function(changes: go.IncrementalData) {
      this.paletteNodeData = DataSyncService.syncNodeData(changes, this.paletteNodeData);
      this.paletteLinkData = DataSyncService.syncLinkData(changes, this.paletteLinkData);
      this.paletteModelData = DataSyncService.syncModelData(changes, this.paletteModelData);
    };

  ngOnInit(): void {
  }

}
