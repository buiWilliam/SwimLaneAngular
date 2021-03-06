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
          $(go.Shape, new go.Binding('figure','key'), new go.Binding('fill','color'),
            {
              stroke: null,
            },
          ),
          $(go.TextBlock, { stroke:"white", margin: 5, editable: true, isMultiline:false},
            new go.Binding('text', 'key').makeTwoWay())
        );
  
      palette.model = $(go.GraphLinksModel,
        {
          linkKeyProperty: 'key'  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        });
      return palette;
    }
    public paletteNodeData: go.ObjectData[] = [
      {key: "Rectangle",figure:"Rectangle",color:"red"},
      {key:"Triangle",figure:"Triangle",color:"green"},
      {key:"Circle",figure:"Circle", color:"blue"}
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
