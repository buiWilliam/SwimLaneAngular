import { Component, OnInit, Input, ViewEncapsulation, ViewChild, ContentChild } from '@angular/core';
import * as go from 'gojs';
import { DataSyncService } from 'gojs-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { element } from 'protractor';

const $ = go.GraphObject.make

var diagram: go.Diagram

var MINLENGTH = 200;  // this controls the minimum length of any swimlane
var MINBREADTH = 20;  // this controls the minimum breadth of any non-collapsed swimlane

function relayoutLanes() {
  diagram.nodes.each(function (lane) {
    if (!(lane instanceof go.Group)) return;
    if (lane.category === "Pool") return;
    lane.layout.isValidLayout = false;  // force it to be invalid
  });
  diagram.layoutDiagram();
}

function relayoutDiagram() {
  diagram.layout.invalidateLayout();
  diagram.findTopLevelGroups().each(function (g) { if (g.category === "Pool") g.layout.invalidateLayout(); });
  diagram.layoutDiagram();
}

function computeMinPoolSize(pool) {
  // assert(pool instanceof go.Group && pool.category === "Pool");
  var len = MINLENGTH;
  pool.memberParts.each(function (lane) {
    // pools ought to only contain lanes, not plain Nodes
    if (!(lane instanceof go.Group))
      return;
    var holder = lane.placeholder;
    if (holder !== null) {
      var sz = holder.actualBounds;
      len = Math.max(len, sz.width);
    }
  });
  return new go.Size(len, NaN);
}

function computeLaneSize(lane) {
  // assert(lane instanceof go.Group && lane.category !== "Pool");
  var sz = computeMinLaneSize(lane);
  if (lane.isSubGraphExpanded) {
    var holder = lane.placeholder;
    if (holder !== null) {
      var hsz = holder.actualBounds;
      sz.height = Math.max(sz.height, hsz.height);
    }
  }
  // minimum breadth needs to be big enough to hold the header
  var hdr = lane.findObject("HEADER");
  if (hdr !== null) sz.height = Math.max(sz.height, hdr.actualBounds.height);
  return sz;
}

function computeMinLaneSize(lane) {
  if (!lane.isSubGraphExpanded) return new go.Size(MINLENGTH, 1);
  return new go.Size(MINLENGTH, MINBREADTH);
}

export class LaneResizingTool extends go.ResizingTool {

  constructor() {
    super()
    go.ResizingTool.call(this)
  }

  isLengthening() {
    return (this.handle.alignment === go.Spot.Right);
  }

  computeMixSize() {
    var lane = this.adornedObject.part;
    // assert(lane instanceof go.Group && lane.category !== "Pool");
    var msz = computeMinLaneSize(lane);  // get the absolute minimum size
    if (this.isLengthening()) {  // compute the minimum length of all lanes
      var sz = computeMinPoolSize(lane.containingGroup);
      msz.width = Math.max(msz.width, sz.width);
    } else {  // find the minimum size of this single lane
      var sz = computeLaneSize(lane);
      msz.width = Math.max(msz.width, sz.width);
      msz.height = Math.max(msz.height, sz.height);
    }
    return msz;
  }

  resize(newr) {
    var lane = this.adornedObject.part;
    if (this.isLengthening()) {  // changing the length of all of the lanes
      lane.containingGroup.memberParts.each(function (lane) {
        if (!(lane instanceof go.Group)) return;
        var shape = lane.resizeObject;
        if (shape !== null) {  // set its desiredSize length, but leave each breadth alone
          shape.width = newr.width;
        }
      });
    } else {  // changing the breadth of a single lane
      go.ResizingTool.prototype.resize.call(this, newr);
    }
    relayoutDiagram();  // now that the lane has changed size, layout the pool again
  }
}

export class PoolLayout extends go.GridLayout {
  constructor() {
    super()
    go.GridLayout.call(this);
    this.cellSize = new go.Size(1, 1);
    this.wrappingColumn = 1;
    this.wrappingWidth = Infinity;
    this.isRealtime = false;  // don't continuously layout while dragging
    this.alignment = go.GridLayout.Position;
    // This sorts based on the location of each Group.
    // This is useful when Groups can be moved up and down in order to change their order.
    this.comparer = function (a, b) {
      var ay = a.location.y;
      var by = b.location.y;
      if (isNaN(ay) || isNaN(by)) return 0;
      if (ay < by) return -1;
      if (ay > by) return 1;
      return 0;
    };
  }

  doLayout(coll) {
    var dia = diagram;
    if (dia === null) return;
    dia.startTransaction("PoolLayout");
    var pool = this.group;
    if (pool !== null && pool.category === "Pool") {
      // make sure all of the Group Shapes are big enough
      var minsize = computeMinPoolSize(pool);
      pool.memberParts.each(function (lane) {
        if (!(lane instanceof go.Group)) return;
        if (lane.category !== "Pool") {
          var shape = lane.resizeObject;
          if (shape !== null) {  // change the desiredSize to be big enough in both directions
            var sz = computeLaneSize(lane);
            shape.width = (isNaN(shape.width) ? minsize.width : Math.max(shape.width, minsize.width));
            shape.height = (!isNaN(shape.height)) ? Math.max(shape.height, sz.height) : sz.height;
            var cell = lane.resizeCellSize;
            if (!isNaN(shape.width) && !isNaN(cell.width) && cell.width > 0) shape.width = Math.ceil(shape.width / cell.width) * cell.width;
            if (!isNaN(shape.height) && !isNaN(cell.height) && cell.height > 0) shape.height = Math.ceil(shape.height / cell.height) * cell.height;
          }
        }
      });
    }
    // now do all of the usual stuff, according to whatever properties have been set on this GridLayout
    go.GridLayout.prototype.doLayout.call(this, coll);
    dia.commitTransaction("PoolLayout");
  }
}

@Component({
  selector: 'app-swim-lane',
  templateUrl: './swim-lane.component.html',
  styleUrls: ['./swim-lane.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class SwimLaneComponent implements OnInit {
  message: string
  demo = false
  pools: Array<go.ObjectData>
  showArrays = false
  selectedGroup: string
  poolName = "Pool3"
  laneName = "Lane7"
  selectedPool = "Pool2"
  selectedNode: go.ObjectData
  nodes: Array<go.ObjectData>
  lanes: Array<go.ObjectData>
  selectedLane = "Lane3"
  nodeName = "threeA"
  renameNode = "1A"
  selectedColor = "lightblue"
  @ViewChild('myDiagram') myDiagram
  @ViewChild('addButton') addButton
  constructor(private _snackBar: MatSnackBar) {
  }

  // initialize diagram / templates
  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    diagram = $(go.Diagram,
      {
        // use a custom ResizingTool (along with a custom ResizeAdornment on each Group)
        resizingTool: new LaneResizingTool(),
        // use a simple layout that ignores links to stack the top-level Pool Groups next to each other
        layout: $(PoolLayout),
        // don't allow dropping onto the diagram's background unless they are all Groups (lanes or pools)
        mouseDragOver: function (e) {
          if (!e.diagram.selection.all(function (n) {
            return n instanceof go.Group;
          })) {
            e.diagram.currentCursor = 'not-allowed';
          }
        },
        mouseDrop: function (e) {
          if (!e.diagram.selection.all(function (n) { return n instanceof go.Group; })) {
            e.diagram.currentTool.doCancel();
          }
        },
        // a clipboard copied node is pasted into the original node's group (i.e. lane).
        "commandHandler.copiesGroupKey": true,
        // automatically re-layout the swim lanes after dragging the selection
        "SelectionMoved": (event) => relayoutDiagram(),  // this DiagramEvent listener is
        "SelectionCopied": (event) => relayoutDiagram(), // defined above
        "animationManager.isEnabled": false,
        "undoManager.isEnabled": true, //must be allow for model change listening
        'undoManager.maxHistoryLength': 0, // to disable undo & redo
        model: $(go.GraphLinksModel,
          {
            linkKeyProperty: 'key'
          })
      })

    diagram.nodeTemplate = $(go.Node, "Auto",
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, "Rectangle",
        { fill: "white", portId: "", cursor: "pointer", fromLinkable: true, toLinkable: true }),
      $(go.TextBlock, { margin: 5, editable: true, isMultiline: false },
        new go.Binding("text", "text").makeTwoWay()),
      { dragComputation: stayInGroup } // limit dragging of Nodes to stay within the containing Group, defined above
    );

    diagram.groupTemplate = $(go.Group, "Horizontal", groupStyle(),
      {
        selectionObjectName: "SHAPE",  // selecting a lane causes the body of the lane to be highlit, not the label
        resizable: true, resizeObjectName: "SHAPE",  // the custom resizeAdornmentTemplate only permits two kinds of resizing
        layout: $(go.LayeredDigraphLayout,  // automatically lay out the lane's subgraph
          {
            isInitial: true,
            isOngoing: false,  // don't invalidate layout when nodes or links are added or removed
            direction: 0,
            columnSpacing: 10,
            layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource
          }),
        computesBoundsAfterDrag: true,  // needed to prevent recomputing Group.placeholder bounds too soon
        computesBoundsIncludingLinks: false,  // to reduce occurrences of links going briefly outside the lane
        computesBoundsIncludingLocation: true,  // to support empty space at top-left corner of lane
        handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
        mouseDrop:
          function (e, grp: go.Group) {  // dropping a copy of some Nodes and Links onto this Group adds them to this Group
            if (!e.shift) return;  // cannot change groups with an unmodified drag-and-drop
            // don't allow drag-and-dropping a mix of regular Nodes and Groups
            if (!e.diagram.selection.any(function (n) { return n instanceof go.Group; })) {
              var ok = grp.addMembers(grp.diagram.selection, true);
              if (ok) {
                updateCrossLaneLinks(grp);
              } else {
                grp.diagram.currentTool.doCancel();
              }
            } else {
              e.diagram.currentTool.doCancel();
            }
          },
        subGraphExpandedChanged: function (grp) {
          var shp = grp.resizeObject;
          if (grp.diagram.undoManager.isUndoingRedoing) return;
          if (grp.isSubGraphExpanded) {
            shp.height = grp._savedBreadth;
          } else {
            grp._savedBreadth = shp.height;
            shp.height = NaN;
          }
          updateCrossLaneLinks(grp);
        }
      },
      new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),
      // the lane header consisting of a Shape and a TextBlock
      $(go.Panel, "Horizontal",
        {
          name: "HEADER",
          angle: 270,  // maybe rotate the header to read sideways going up
          alignment: go.Spot.Center
        },
        $(go.Panel, "Horizontal",  // this is hidden when the swimlane is collapsed
          new go.Binding("visible", "isSubGraphExpanded").ofObject(),
          $(go.Shape, "Diamond",
            { width: 8, height: 8, fill: "white" },
            new go.Binding("fill", "color")),
          $(go.TextBlock,  // the lane label
            { font: "bold 13pt sans-serif", editable: true, margin: new go.Margin(2, 0, 0, 0) },
            new go.Binding("text", "text").makeTwoWay())
        ),
        $("SubGraphExpanderButton", { margin: 5 })  // but this remains always visible!
      ),  // end Horizontal Panel
      $(go.Panel, "Auto",  // the lane consisting of a background Shape and a Placeholder representing the subgraph
        $(go.Shape, "Rectangle",  // this is the resized object
          { name: "SHAPE", fill: "white" },
          new go.Binding("fill", "color"),
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
        $(go.Placeholder,
          { padding: 12, alignment: go.Spot.TopLeft }),
        $(go.TextBlock,  // this TextBlock is only seen when the swimlane is collapsed
          {
            name: "LABEL",
            font: "bold 13pt sans-serif", editable: true,
            angle: 0, alignment: go.Spot.TopLeft, margin: new go.Margin(2, 0, 0, 4)
          },
          new go.Binding("visible", "isSubGraphExpanded", function (e) { return !e; }).ofObject(),
          new go.Binding("text", "text").makeTwoWay())
      ), { dragComputation: stayInGroup }  // end Auto Panel
    );  // end Group

    diagram.groupTemplate.resizeAdornmentTemplate = $(go.Adornment, "Spot",
      $(go.Placeholder),
      $(go.Shape,  // for changing the length of a lane
        {
          alignment: go.Spot.Right,
          desiredSize: new go.Size(7, 50),
          fill: "lightblue", stroke: "dodgerblue",
          cursor: "col-resize"
        },
        new go.Binding("visible", "", function (ad) {
          if (ad.adornedPart === null) return false;
          return ad.adornedPart.isSubGraphExpanded;
        }).ofObject()),
      $(go.Shape,  // for changing the breadth of a lane
        {
          alignment: go.Spot.Bottom,
          desiredSize: new go.Size(50, 7),
          fill: "lightblue", stroke: "dodgerblue",
          cursor: "row-resize"
        },
        new go.Binding("visible", "", function (ad) {
          if (ad.adornedPart === null) return false;
          return ad.adornedPart.isSubGraphExpanded;
        }).ofObject())
    );

    diagram.groupTemplateMap.add("Pool",
      $(go.Group, "Auto", groupStyle(),
        { // use a simple layout that ignores links to stack the "lane" Groups on top of each other
          layout: $(PoolLayout, { spacing: new go.Size(0, 0) })  // no space between lanes
        },
        $(go.Shape,
          { fill: "white" },
          new go.Binding("fill", "color")),
        $(go.Panel, "Table",
          { defaultColumnSeparatorStroke: "black" },
          $(go.Panel, "Horizontal",
            { column: 0, angle: 270 },
            $(go.TextBlock,
              { font: "bold 16pt sans-serif", editable: true, margin: new go.Margin(2, 0, 0, 0) },
              new go.Binding("text").makeTwoWay())
          ),
          $(go.Placeholder,
            { column: 1 })
        )
      ));

    diagram.linkTemplate =
      $(go.Link,
        { routing: go.Link.AvoidsNodes, corner: 5 },
        { relinkableFrom: true, relinkableTo: true },
        $(go.Shape),
        $(go.Shape, { toArrow: "Standard" })
      );

    function stayInGroup(part, pt, gridpt) {
      // don't constrain top-level nodes
      var grp = part.containingGroup;
      if (grp === null)
        return pt;
      // try to stay within the background Shape of the Group
      var back = grp.resizeObject;
      if (back === null)
        return pt;
      // allow dragging a Node out of a Group if the Shift key is down
      if (part.diagram.lastInput.shift)
        return pt;
      var p1 = back.getDocumentPoint(go.Spot.TopLeft);
      var p2 = back.getDocumentPoint(go.Spot.BottomRight);
      var b = part.actualBounds;
      var loc = part.location;
      // find the padding inside the group's placeholder that is around the member parts
      var m = grp.placeholder.padding;
      // now limit the location appropriately
      var x = Math.max(p1.x + m.left, Math.min(pt.x, p2.x - m.right - b.width - 1)) + (loc.x - b.x);
      var y = Math.max(p1.y + m.top, Math.min(pt.y, p2.y - m.bottom - b.height - 1)) + (loc.y - b.y);
      return new go.Point(x, y);
    }

    function groupStyle() {  // common settings for both Lane and Pool Groups
      return [
        {
          layerName: "Background",  // all pools and lanes are always behind all nodes and links
          background: "transparent",  // can grab anywhere in bounds
          movable: true, // allows users to re-order by dragging
          copyable: false,  // can't copy lanes or pools
          avoidable: false,  // don't impede AvoidsNodes routed Links
          minLocation: new go.Point(NaN, -Infinity),  // only allow vertical movement
          maxLocation: new go.Point(NaN, Infinity)
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify)
      ];
    }

    function updateCrossLaneLinks(group) {
      group.findExternalLinksConnected().each(function (l) {
        l.visible = (l.fromNode.isVisible() && l.toNode.isVisible());
      });
    }

    diagram.addDiagramListener("ObjectSingleClicked",
      function (e) {
        var data = e.subject.part.data
        if (!(data instanceof go.Link)) console.log("Clicked on " + data.key);
      });

    diagram.addDiagramListener("ObjectContextClicked",
      function (e) {
        var data = e.subject.part.data
        if (!(data instanceof go.Link)) console.log("Right Clicked on " + data.key);
      });

    diagram.addDiagramListener("ExternalObjectsDropped",
      function (e) {
        e.subject.each(val => {
          if (!(val instanceof go.Link)) console.log("Dropped in " + val.key);
        })
      });

    diagram.addDiagramListener("TextEdited",
      (e) => {
        if (!(e instanceof go.Link)) console.log("Change " + e.subject.part.data.key + " to " + e.subject.text);
        console.log(this)
        var node = this.nodeDataArray.find(element => element.key == e.subject.part.key)
        console.log(node)
        node.key = e.subject.text
        node.text = e.subject.text
        var links = this.linkDataArray.filter(element => element.from == e.subject.part.key || element.to == e.subject.part.key)
        console.log(links)
        for (let link of links) {
          if (link.from == e.subject.part.key)
            link.from = e.subject.text
          if (link.to == e.subject.part.key)
            link.to = e.subject.text
        }
        relayoutLanes()
        setTimeout(() => {
          relayoutLanes()
        })
        relayoutDiagram()
      });

    relayoutLanes()
    return diagram;
  }

  public nodeDataArray: Array<go.ObjectData> =
    [ // node data
      { key: "Pool1", text: "Pool", isGroup: true, category: "Pool" },
      { key: "Pool2", text: "Pool2", isGroup: true, category: "Pool" },
      { key: "Lane1", text: "Lane1", isGroup: true, group: "Pool1", color: "lightblue" },
      { key: "Lane2", text: "Lane2", isGroup: true, group: "Pool1", color: "lightgreen" },
      { key: "Lane3", text: "Lane3", isGroup: true, group: "Pool1", color: "lightyellow" },
      { key: "Lane4", text: "Lane4", isGroup: true, group: "Pool1", color: "orange" },
      { key: "oneA", text: "oneA", group: "Lane1" },
      { key: "oneB", text: "oneB", group: "Lane1" },
      { key: "oneC", text: "oneC", group: "Lane1" },
      { key: "oneD", text: "oneD", group: "Lane1" },
      { key: "twoA", text: "twoA", group: "Lane2" },
      { key: "twoB", text: "twoB", group: "Lane2" },
      { key: "twoC", text: "twoC", group: "Lane2" },
      { key: "twoD", text: "twoD", group: "Lane2" },
      { key: "twoE", text: "twoE", group: "Lane2" },
      { key: "twoF", text: "twoF", group: "Lane2" },
      { key: "twoG", text: "twoG", group: "Lane2" },
      { key: "fourA", text: "fourA", group: "Lane4" },
      { key: "fourB", text: "fourB", group: "Lane4" },
      { key: "fourC", text: "fourC", group: "Lane4" },
      { key: "fourD", text: "fourD", group: "Lane4" },
      { key: "Lane5", text: "Lane5", isGroup: true, group: "Pool2", color: "lightyellow" },
      { key: "Lane6", text: "Lane6", isGroup: true, group: "Pool2", color: "lightgreen" },
      { key: "fiveA", text: "fiveA", group: "Lane5" },
      { key: "sixA", text: "sixA", group: "Lane6" }
    ]
  public linkDataArray: Array<go.ObjectData> =
    [ // link data
      { from: "oneA", to: "oneB" },
      { from: "oneA", to: "oneC" },
      { from: "oneB", to: "oneD" },
      { from: "oneC", to: "oneD" },
      { from: "twoA", to: "twoB" },
      { from: "twoA", to: "twoC" },
      { from: "twoA", to: "twoF" },
      { from: "twoB", to: "twoD" },
      { from: "twoC", to: "twoD" },
      { from: "twoD", to: "twoG" },
      { from: "twoE", to: "twoG" },
      { from: "twoF", to: "twoG" },
      { from: "fourA", to: "fourB" },
      { from: "fourB", to: "fourC" },
      { from: "fourC", to: "fourD" },
    ]
  public diagramDivClassName: string = 'myDiagramDiv';

  // When the diagram model changes, update app data to reflect those changes
  public diagramModelChange = function (changes: go.IncrementalData) {
    this.nodeDataArray = DataSyncService.syncNodeData(changes, this.nodeDataArray);
    this.linkDataArray = DataSyncService.syncLinkData(changes, this.linkDataArray);
  };

  doAdd() {
    this.demo = true
    console.log(this.selectedGroup)
    if (this.selectedGroup == "Pool") {
      this.nodeDataArray.push({ key: this.poolName, text: this.poolName, isGroup: true, category: "Pool" })
      this.pools = this.nodeDataArray.filter(element => element.category == 'Pool')
      this.message = "Added "+this.poolName
      this.openSnackBar()
    }
    else if (this.selectedGroup == "Lane") {
      this.nodeDataArray.push({ key: this.laneName, text: this.laneName, isGroup: true, group: this.selectedPool, color: this.selectedColor })
      this.lanes = this.nodeDataArray.filter(element => element.category != 'Pool' && element.isGroup == true)
      this.message = "Added "+this.laneName+" to "+this.selectedPool
      this.openSnackBar()
    }
    else if (this.selectedGroup == "Node") {
      this.nodeDataArray.push({ key: this.nodeName, text: this.nodeName, group: this.selectedLane })
      this.nodes = this.nodeDataArray.filter(element => element.isGroup == undefined)
      this.message = "Added "+this.nodeName+" to "+this.selectedLane
      this.openSnackBar()
      relayoutLanes()
      setTimeout(() => {
        relayoutLanes()
      })
    }
    relayoutDiagram()
  }

  doModify() {
    this.demo = true
    this.message = "Modified " + this.selectedNode.key + " of " + this.selectedNode.group + " to " + this.renameNode
    this.openSnackBar()
    console.log(this.selectedNode.key)
    var node = this.nodeDataArray.find(element => element.key == this.selectedNode.key)
    var oldNode = node.key
    node.key = this.renameNode
    node.text = this.renameNode
    var links = this.linkDataArray.filter(element => (element.from == "oneA" || element.to == "oneA"))
    console.log(links)
    console.log(this.selectedNode.key.length)
    links = this.linkDataArray.filter(element => (element.from == oldNode || element.to == oldNode))
    console.log(links)
    for (let link of links) {
      if (link.from == oldNode)
        link.from = this.renameNode
      if (link.to == oldNode)
        link.to = this.renameNode
    }
    relayoutLanes()
    setTimeout(() => {
      relayoutLanes()
    })
    relayoutDiagram()
    this.nodes = this.nodeDataArray.filter(element => element.isGroup == undefined)
  }

  doShow() {
    if(this.showArrays==false)
      this.showArrays = true
    else
      this.showArrays = false
  }

  openSnackBar() {
    this._snackBar.open(this.message, "x",{duration:2000})
  }

  onKeyupPool(event){
    console.log(this.pools)
    console.log(event.target.value)
    console.log(this.addButton)
    console.log(this.pools.filter(element=>element.key==event.target.value))
    this.addButton.disable = this.pools.filter(element=>element.key==event.target.value).length > 0
  }

  ngOnInit(): void {
    this.pools = this.nodeDataArray.filter(element => element.category == 'Pool')
    this.lanes = this.nodeDataArray.filter(element => element.category != 'Pool' && element.isGroup == true)
    this.nodes = this.nodeDataArray.filter(element => element.isGroup == undefined)
    this.selectedNode = this.nodes[0]
    console.log(this.pools)
    console.log(this.nodes)
  }
}
